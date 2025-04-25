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
      const decoded = jwt.verify(token, this.getJwtSecret()) as jwt.JwtPayload;
      
      // Check if token has expired
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        throw new UnauthorizedException('Token has expired');
      }

      return decoded;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      }
      if (err instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      }
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
