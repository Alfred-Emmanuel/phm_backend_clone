import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Admin } from '../../modules/admin/entities/admin.entity';
import { RequestWithUser } from '../interfaces/request.interface';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(
    @InjectModel(Admin)
    private adminModel: typeof Admin,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    
    if (request.user?.role !== 'admin') {
      return false;
    }

    const admin = await this.adminModel.findOne({
      where: { userId: request.user.userId },
    });

    return admin?.isSuperAdmin === true;
  }
} 