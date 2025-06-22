import {
  Column,
  Model,
  Table,
  DataType,
  CreatedAt,
  UpdatedAt,
  HasMany,
} from 'sequelize-typescript';
import { PaymentCourse } from './payment-course.entity';

@Table({
  tableName: 'payments',
  timestamps: true,
  underscored: true, // ensures all columns are snake_case
})
export class Payment extends Model<Payment> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    field: 'id',
  })
  declare id: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  declare userId: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'amount',
  })
  declare amount: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'reference',
  })
  declare reference: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'pending',
    field: 'status',
  })
  declare status: 'pending' | 'paid' | 'failed';

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'gateway_response',
  })
  declare gatewayResponse?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'authorization_url',
  })
  declare authorizationUrl: string;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  @HasMany(() => PaymentCourse, { as: 'paymentCourses', foreignKey: 'paymentId' })
  paymentCourses: PaymentCourse[];
}
