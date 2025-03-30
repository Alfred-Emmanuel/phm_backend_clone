import { Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';

@Injectable()
export class VerificationTokenService {
  generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  getExpirationDate(): Date {
    const date = new Date();
    date.setHours(date.getHours() + 24); // Token expires in 24 hours
    return date;
  }
}
