import * as crypto from 'node:crypto';
import * as jwt from 'jsonwebtoken';
import { Secret } from 'jsonwebtoken';
import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { IJwtData, ITokenDetails } from '../interfaces/jwt.interface';
import config from '../../config/config';

@Injectable()
export class TokenService {
  private getJwtSecret(): string {
    const secret = config.auth.accessTokenSecret;
    if (!secret) {
      throw new InternalServerErrorException('JWT secret is not defined');
    }
    return secret;
  }

  async getTokens(data: IJwtData): Promise<string[]> {
    return await Promise.all([
      this._generateAccessToken(data),
      this._generateRefreshToken(data),
    ]);
  }

  async extractTokenDetails(tokenFromHeader: string): Promise<ITokenDetails> {
    const token = tokenFromHeader.split(' ').pop()!;
    const tokenDetails = await this.verifyToken(token);
    const tokenPayload = tokenDetails as jwt.JwtPayload;
    const timeToExpiry = tokenPayload.exp as number;

    return {
      user: {
        id: tokenDetails.id,
        email: tokenDetails.email,
      },
      token,
      expiration: new Date(timeToExpiry * 1000),
    };
  }

  verifyToken(token: string): jwt.JwtPayload {
    try {
      return jwt.verify(token, this.getJwtSecret()) as jwt.JwtPayload;
    } catch (err) {
      throw new UnauthorizedException('Invalid token provided');
    }
  }

  private _generateAccessToken(data: IJwtData): string {
    return this._generateToken({
      data,
      secret: this.getJwtSecret(),
      expiresIn: config.auth.accessTokenExpiresIn,
    });
  }

  private _generateRefreshToken(data: IJwtData): string {
    return this._generateToken({
      data,
      secret: this.getJwtSecret(),
      expiresIn: config.auth.refreshTokenExpiresIn,
    });
  }

  private _generateToken({
    data,
    secret,
    expiresIn,
  }: {
    data: IJwtData;
    expiresIn: string;
    secret: string;
  }): string {
    return jwt.sign(data, secret as Secret, {
      expiresIn,
      jwtid: crypto.randomUUID(),
    });
  }
}
