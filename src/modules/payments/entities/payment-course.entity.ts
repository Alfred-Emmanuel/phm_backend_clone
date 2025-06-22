import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Payment } from './payment.entity';
import { Course } from '../../courses/entities/course.entity';

@Table({ tableName: 'payment_courses', timestamps: false })
export class PaymentCourse extends Model<PaymentCourse> {
  @ForeignKey(() => Payment)
  @Column({ type: DataType.UUID, allowNull: false, field: 'payment_id', primaryKey: true })
  declare paymentId: string;

  @ForeignKey(() => Course)
  @Column({ type: DataType.UUID, allowNull: false, field: 'course_id', primaryKey: true })
  declare courseId: string;
}
