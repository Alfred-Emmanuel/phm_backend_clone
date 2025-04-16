import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from './modules/users/user.module';
import { CourseModule } from './modules/courses/course.module';
import { CourseEnrollmentModule } from './modules/course-enrollments/course-enrollment.module';
import { LessonModule } from './modules/lessons/lesson.module';
import { AssignmentModule } from './modules/assignments/assignment.module';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import emailConfig from './config/email.config';
import appConfig from './config/app.config';
import { JwtStrategy } from './shared/guards/jwt.strategy';
import { TokenService } from './shared/services/token.service';
import { AdminModule } from './modules/admin/admin.module';
import { CategoriesModule } from './modules/categories/categories.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, emailConfig, appConfig],
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
      }),
      inject: [ConfigService],
    }),
    UserModule,
    CourseModule,
    CourseEnrollmentModule,
    LessonModule,
    AssignmentModule,
    AdminModule,
    CategoriesModule,
  ],
  providers: [JwtStrategy, TokenService],
})
export class AppModule {}
