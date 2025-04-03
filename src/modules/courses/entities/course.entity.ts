import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';

@Table
export class Course extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare instructorId: string;

  @BelongsTo(() => User, 'instructorId')
  declare instructor: User;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare createdAt: Date;
}
