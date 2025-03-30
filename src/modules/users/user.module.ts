import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { TokenService } from '../../shared/services/token.service';
import { EmailService } from '../../shared/services/email.service';
import { VerificationTokenService } from '../../shared/services/verification-token.service';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  controllers: [UserController],
  providers: [
    UserService,
    TokenService,
    EmailService,
    VerificationTokenService,
  ],
  exports: [UserService],
})
export class UserModule {}
