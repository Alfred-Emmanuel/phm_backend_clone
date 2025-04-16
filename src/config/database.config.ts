import config from './config';
import { registerAs } from '@nestjs/config';
import { User } from 'src/modules/users/entities/user.entity';
import { Course } from 'src/modules/courses/entities/course.entity';
import { CourseEnrollment } from 'src/modules/course-enrollments/entities/course-enrollment.entity';
import { Lesson } from 'src/modules/lessons/entities/lesson.entity';
import { Assignment } from 'src/modules/assignments/entities/assignment.entity';
import { Admin } from 'src/modules/admin/entities/admin.entity';
import { AdminActionLog } from 'src/modules/admin/entities/admin_action_log.entity';
import { Category } from 'src/modules/categories/entities/category.entity';
import { CourseCategory } from 'src/modules/categories/entities/course-category.entity';

export default registerAs('database', () => ({
  dialect: 'postgres',
  host: config.db.postgresql.host,
  port: config.db.postgresql.port,
  username: config.db.postgresql.user,
  password: config.db.postgresql.password,
  database: config.db.postgresql.database,
  // url: config.db.postgresql.url,
  models: [
    User,
    Course,
    CourseEnrollment,
    Lesson,
    Assignment,
    Admin,
    AdminActionLog,
    Category,
    CourseCategory
  ],
  autoLoadModels: config.db.postgresql.autoLoadModels,
  synchronize: config.db.postgresql.synchronize,
}));
