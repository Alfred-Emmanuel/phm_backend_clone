import { forwardRef, Module } from '@nestjs/common';
import { PaymentsService } from './services/payments.service';
import { PaymentsController } from './controllers/payments.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Payment } from './entities/payment.entity';
import { PaymentCourse } from './entities/payment-course.entity';
import { Course } from '../courses/entities/course.entity';
import { UserModule } from '../users/user.module';
import { CourseModule } from '../courses/course.module';
import { CourseEnrollmentModule } from '../course-enrollments/course-enrollment.module';
import { PaymentStatusJobService } from './payment-status-job.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Payment, PaymentCourse, Course]),
    UserModule,
    CourseModule,
    forwardRef(() => CourseEnrollmentModule),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentStatusJobService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
