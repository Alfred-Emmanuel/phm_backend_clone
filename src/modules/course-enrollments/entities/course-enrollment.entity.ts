  import {
    Column,
    Model,
    Table,
    DataType,
    ForeignKey,
    BelongsTo,
    Index
  } from 'sequelize-typescript';
  import { User } from '../../users/entities/user.entity';
  import { Course } from '../../courses/entities/course.entity';


  @Table({
    tableName: 'course_enrollments',
    timestamps: true,
    indexes: [
      { name: 'idx_user_id', fields: ['user_id'], unique: true },
      { name: 'idx_course_id', fields: ['course_id'], unique: true },
    ]
  })
  export class CourseEnrollment extends Model<CourseEnrollment> {
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
      field: "user_id"
    })
    declare userId: string;

    @ForeignKey(() => Course)
    @Column({
      type: DataType.UUID,
      allowNull: false,
      field: "course_id"
    })
    declare courseId: string;

    @Column({
      type: DataType.DATE,
      allowNull: false,
      defaultValue: DataType.NOW,
      field: "enrollment_date"
    })
    declare enrollmentDate: Date;

    @Column({
      type: DataType.DATE,
      allowNull: false,
      defaultValue: DataType.NOW,
      field: 'created_at'
    })
    declare createdAt: Date;

    @Column({
      type: DataType.DATE,
      allowNull: false,
      defaultValue: DataType.NOW,
      field: 'updated_at'
    })
    declare updatedAt: Date;

    @BelongsTo(() => User, 'userId')
    declare user: User;

    @BelongsTo(() => Course, 'courseId')
    declare course: Course;
  }
