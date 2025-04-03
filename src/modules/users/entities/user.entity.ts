import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table
export class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare firstName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare lastName: string;

  @Column({
    type: DataType.ENUM('admin', 'student', 'instructor'),
    allowNull: false,
    // unique: true,
  })
  declare role: string;

  @Column({
    type: DataType.ENUM('pending', 'approved', 'rejected'),
    allowNull: true,
    defaultValue: null,
  })
  declare instructorStatus: string | null;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare isEmailVerified: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null,
  })
  declare emailVerificationToken: string | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    defaultValue: null,
  })
  declare emailVerificationExpires: Date | null;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare updatedAt: Date;
}
