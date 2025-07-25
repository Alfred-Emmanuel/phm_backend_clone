import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import config from 'src/config/config';
import axios from 'axios';
import { Payment } from './entities/payment.entity';
import { InjectModel } from '@nestjs/sequelize';
import { CourseEnrollmentService } from '../course-enrollments/services/course-enrollment.service';

@Injectable()
export class PaymentStatusJobService {
  private readonly logger = new Logger(PaymentStatusJobService.name);

  constructor(
    @InjectModel(Payment)
    private paymentModel: typeof Payment,
    @Inject(forwardRef(() => CourseEnrollmentService))
    private courseEnrollmentService: CourseEnrollmentService,
  ) {}

  @Cron('*/15 * * * *')
  async checkPendingPayments() {
    const pendingPayments = await this.paymentModel.findAll({
      where: { status: 'pending' },
    });
    for (const payment of pendingPayments) {
      if (!payment.reference) {
        this.logger.warn(`Skipping payment with null reference (id: ${payment.id})`);
        continue;
      }
      try {
        const paystackSecret = config.payments.PAYSTACK_SECRET_KEY;
        const response = await axios.get(
          `https://api.paystack.co/transaction/verify/${payment.reference}`,
          { headers: { Authorization: `Bearer ${paystackSecret}` } }
        );
        const status = response.data.data.status;
        if (status === 'success' || status === 'paid') {
          if (payment.status !== 'paid') {
            payment.status = 'paid';
            await payment.save();
            // Enroll user in all courses linked to this payment
            await payment.reload({ include: ['paymentCourses'] });
            for (const pc of payment.paymentCourses) {
              const alreadyEnrolled = await this.courseEnrollmentService.isUserEnrolled(payment.userId, pc.courseId);
              if (!alreadyEnrolled) {
                await this.courseEnrollmentService.enrollAfterPayment(payment.userId, pc.courseId);
              }
            }
          }
        } else if (status === 'failed' || status === 'abandoned') {
          payment.status = 'failed';
          await payment.save();
        }
        // else: still pending, do nothing
      } catch (err) {
        this.logger.error(`Failed to verify payment ${payment.reference}: ${err.message}`);
      }
    }
  }
}
