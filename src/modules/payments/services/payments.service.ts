import { Injectable, HttpException, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import axios from 'axios';
import { UserService } from '../../users/services/user.service';
import { CourseEnrollmentService } from '../../course-enrollments/services/course-enrollment.service';
import { Payment } from '../entities/payment.entity';
import { InitiatePaymentDto } from '../dto/initiate-payment.dto';
import { VerifyPaymentDto } from '../dto/verify-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment)
    private paymentModel: typeof Payment,
    private userService: UserService,
    @Inject(forwardRef(() => CourseEnrollmentService))
    private courseEnrollmentService: CourseEnrollmentService,
  ) {}

  async initiatePayment(dto: InitiatePaymentDto) {
    // Fetch user email
    const user = await this.userService.findOne(dto.userId);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    // Check for existing pending payment for this user/course
    let payment = await this.paymentModel.findOne({
      where: {
        userId: dto.userId,
        courseId: dto.courseId,
        status: 'pending',
      },
    });
    // Only reuse if valid
    if (payment) {
      if (payment.authorizationUrl && payment.reference) {
        return { authorization_url: payment.authorizationUrl, reference: payment.reference };
      } else {
        // Remove invalid pending payment
        await payment.destroy();
      }
    }

    // Create payment record
    payment = await this.paymentModel.create({
      userId: dto.userId,
      courseId: dto.courseId,
      amount: dto.amount,
      status: 'pending',
    } as any);

    // Call Paystack initialize
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: user.email,
        amount: dto.amount * 100, // Paystack expects kobo
      },
      {
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          'Content-Type': 'application/json',
        },
      },
    );
    const { authorization_url, reference } = response.data.data;
    payment.reference = reference;
    payment.authorizationUrl = authorization_url;
    await payment.save();
    return { authorization_url, reference };
  }

  async verifyPayment(reference: string) {
    if (!reference) {
      throw new HttpException('Reference is required', HttpStatus.BAD_REQUEST);
    }
    const payment = await this.paymentModel.findOne({ where: { reference } });
    if (!payment) {
      throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
    }
    try {
      const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${paystackSecret}`,
          },
        },
      );
      if (response.data.data.status === 'success') {
        payment.status = 'paid';
        payment.gatewayResponse = JSON.stringify(response.data.data);
        await payment.save();
        // Enroll user in course (after payment, do not trigger new payment)
        await this.courseEnrollmentService.enrollAfterPayment(payment.userId, payment.courseId);
        return { status: 'success' };
      } else {
        payment.status = 'failed';
        payment.gatewayResponse = JSON.stringify(response.data.data);
        await payment.save();
        return { status: 'failed' };
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        throw new HttpException(
          error.response.data.message,
          error.response.status || HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException('Paystack verification failed', HttpStatus.BAD_REQUEST);
    }
  }
}
