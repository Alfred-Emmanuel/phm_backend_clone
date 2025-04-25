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
    field: "admin_user_id"
  })
  declare adminUserId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: "action_type"
  })
  declare actionType: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: "target_type"
  })
  declare targetType: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: "target_id"
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
    field: "created_at"
  })
  declare createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: "updated_at"
  })
  declare updatedAt: Date;
} 