import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from '../interfaces/request.interface';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    return request.user?.role === 'admin';
  }
} 