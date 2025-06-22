import { Injectable, HttpException, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import axios from 'axios';
import { UserService } from '../../users/services/user.service';
import { CourseEnrollmentService } from '../../course-enrollments/services/course-enrollment.service';
import { Payment } from '../entities/payment.entity';
import { InitiatePaymentDto } from '../dto/initiate-payment.dto';
import config from 'src/config/config';
import { PaymentCourse } from '../entities/payment-course.entity';
import { Course } from '../../courses/entities/course.entity';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment)
    private paymentModel: typeof Payment,
    @InjectModel(PaymentCourse)
    private paymentCourseModel: typeof PaymentCourse,
    @InjectModel(Course)
    private courseModel: typeof Course,
    private userService: UserService,
    @Inject(forwardRef(() => CourseEnrollmentService))
    private courseEnrollmentService: CourseEnrollmentService,
  ) {}

  async initiatePayment(dto: InitiatePaymentDto) {
    /* ─────────────────────────────
       1.  Validate user & courses
    ──────────────────────────────*/
    const user = await this.userService.findOne(dto.userId);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  
    const courses = await this.courseModel.findAll({ where: { id: dto.courseIds } });
    if (courses.length !== dto.courseIds.length) {
      throw new HttpException('One or more courses not found', HttpStatus.NOT_FOUND);
    }
  
    /* ─────────────────────────────
       2.  Figure out what’s paid
    ──────────────────────────────*/
    const totalAmount = courses.reduce((sum, c) => sum + c.price, 0);
    const paidCourseIds = courses.filter(c => !c.isFree).map(c => c.id);
    const uniquePaidCourseIds = Array.from(new Set(paidCourseIds)).sort();
  
    /* ─────────────────────────────
       3.  Re-use a pending payment
    ──────────────────────────────*/
    if (uniquePaidCourseIds.length) {
      const pendingPayments = await this.paymentModel.findAll({
        where: { userId: dto.userId, status: 'pending' },
        include: [{ model: PaymentCourse, as: 'paymentCourses' }],
      });
  
      for (const pInstance of pendingPayments) {
        const p = pInstance.get({ plain: true }) as {
          reference: string;
          authorizationUrl: string;
          paymentCourses?: { courseId: string }[];
        };
  
        const paymentPaidCourseIds = (p.paymentCourses ?? [])
          .map(pc => pc.courseId)
          .filter(id => uniquePaidCourseIds.includes(id));
  
        const uniquePaymentIds = Array.from(new Set(paymentPaidCourseIds)).sort();
  
        const sameSet =
          uniquePaidCourseIds.length === uniquePaymentIds.length &&
          uniquePaidCourseIds.every((id, i) => id === uniquePaymentIds[i]);
  
        if (sameSet) {
          // Found an existing pending transaction – re-use it
          return {
            authorization_url: p.authorizationUrl,
            reference: p.reference,
          };
        }
      }
    }
  
    /* ─────────────────────────────
       4.  No match → create a new one
    ──────────────────────────────*/
    const payment = await this.paymentModel.create({
      userId: dto.userId,
      amount: totalAmount,
      status: 'pending',
    } as any);
  
    for (const courseId of dto.courseIds) {
      await this.paymentCourseModel.create({ paymentId: payment.id, courseId } as any);
    }
  
    const paystackSecret = config.payments.PAYSTACK_SECRET_KEY;
    const { data } = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: user.email,
        amount: totalAmount * 100, // kobo
      },
      {
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          'Content-Type': 'application/json',
        },
      },
    );
  
    payment.reference = data.data.reference;
    payment.authorizationUrl = data.data.authorization_url;
    await payment.save();
  
    return {
      authorization_url: payment.authorizationUrl,
      reference: payment.reference,
    };
  }
  

  async verifyPayment(reference: string) {
    if (!reference) {
      throw new HttpException('Reference is required', HttpStatus.BAD_REQUEST);
    }
  
    // ────────────────────────────────────────────────────────
    // 1️⃣  Fetch payment (Sequelize instance with include)
    // ────────────────────────────────────────────────────────
    const paymentInstance = await this.paymentModel.findOne({
      where: { reference },
      include: [{ model: PaymentCourse, as: 'paymentCourses' }],
    });
  
    if (!paymentInstance) {
      throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
    }
  
    // ────────────────────────────────────────────────────────
    // 2️⃣  Convert to a plain object so associations are
    //     directly accessible as properties
    // ────────────────────────────────────────────────────────
    const payment = paymentInstance.get({ plain: true }) as {
      id: string;
      userId: string;
      amount: number;
      reference: string;
      status: string;
      gatewayResponse: string | null;
      authorizationUrl: string;
      paymentCourses?: { courseId: string }[];
      // add other props if you need strong typing
    };
  
    try {
      const paystackSecret = config.payments.PAYSTACK_SECRET_KEY;
      const { data: verify } = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: { Authorization: `Bearer ${paystackSecret}` },
        },
      );
  
      console.log('DEBUG: payment.paymentCourses', payment.paymentCourses);
  
      // ────────────────────────────────────────────────────────
      // 3️⃣  Update status & save on the original instance
      // ────────────────────────────────────────────────────────
      paymentInstance.status = verify.data.status === 'success' ? 'paid' : 'failed';
      paymentInstance.gatewayResponse = JSON.stringify(verify.data);
      await paymentInstance.save();
  
      // ────────────────────────────────────────────────────────
      // 4️⃣  Enrol user in linked courses if payment succeeded
      // ────────────────────────────────────────────────────────
      if (verify.data.status === 'success') {
        for (const pc of payment.paymentCourses ?? []) {
          await this.courseEnrollmentService.enrollAfterPayment(
            payment.userId,
            pc.courseId,
          );
        }
        return { status: 'success' };
      }
  
      return { status: 'failed' };
    } catch (error) {
      // ────────────────────────────────────────────────────────
      // 5️⃣  Robust error handling
      // ────────────────────────────────────────────────────────
      throw new HttpException(
        {
          message: 'Paystack verification failed',
          details: {
            reference,
            message: error.message,
            responseStatus: error.response?.status,
            responseData: error.response?.data,
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  
}
