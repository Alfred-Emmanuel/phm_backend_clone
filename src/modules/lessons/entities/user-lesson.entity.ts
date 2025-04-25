import { Column, Model, Table, DataType, ForeignKey, AllowNull, BelongsTo } from "sequelize-typescript"
import { User } from "src/modules/users/entities/user.entity"
import { Lesson } from "./lesson.entity"

@Table({
    tableName: 'user_lessons',
    timestamps: false,
})
export class UserLesson extends Model<UserLesson> {
    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        primaryKey: true,
        field: "user_id"
    })
    declare userId: string; 

    @ForeignKey(() => Lesson)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        primaryKey: true,
        field: "lesson_id"
    })
    declare lessonId: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    declare completed: boolean

    @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    field: "is_bookmarked"
    })
    declare isBookmarked: boolean

    @Column({
        type: DataType.DATE,
        allowNull: true,
        defaultValue: DataType.NOW,
        field: "completed_at"
    })
    declare completedAt: Date | null

    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
        field: "started_at"
    })
    declare startedAt: Date

    @BelongsTo(() => User)
    user: User;

    @BelongsTo(() => Lesson)
    lesson: Lesson;

}
