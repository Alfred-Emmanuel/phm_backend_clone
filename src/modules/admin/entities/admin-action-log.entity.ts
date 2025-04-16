import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';

@Table({
  tableName: 'admin_action_logs',
  timestamps: true,
})
export class AdminActionLog extends Model<AdminActionLog> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare adminUserId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare actionType: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare targetType: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare targetId: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare details: object;

  @BelongsTo(() => User, 'adminUserId')
  declare adminUser: User;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare createdAt: Date;
} 