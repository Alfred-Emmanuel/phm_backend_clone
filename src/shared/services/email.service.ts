import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('email.host');
    const port = this.configService.get<number>('email.port');
    const user = this.configService.get<string>('email.user');
    const password = this.configService.get<string>('email.password');

    if (!host || !port || !user || !password) {
      throw new Error('Email configuration is incomplete');
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: true,
      auth: {
        user,
        pass: password,
      },
    });

    // Verify the connection configuration
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('Failed to connect to email server:', error);
        throw error;
      }
      this.logger.log('Email server connection established');
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    try {
      const appUrl = this.configService.get<string>('app.url');
      if (!appUrl) {
        throw new Error('Application URL is not configured');
      }

      const verificationUrl = `${appUrl}/users/verify-email?token=${token}`;
      const from = this.configService.get<string>('email.from');

      if (!from) {
        throw new Error('Email sender address is not configured');
      }

      await this.transporter.sendMail({
        from,
        to: email,
        subject: 'Verify your email',
        html: `
          <h1>Email Verification</h1>
          <p>Please click the link below to verify your email:</p>
          <a href="${verificationUrl}">${verificationUrl}</a>
          <p>This link will expire in 24 hours.</p>
        `,
      });

      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${email}:`,
        error,
      );
      throw new Error('Failed to send verification email');
    }
  }

  // ...existing code...

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    try {
      const appUrl = this.configService.get<string>('app.url');
      if (!appUrl) {
        throw new Error('Application URL is not configured');
      }

      const resetUrl = `${appUrl}/users/reset-password?token=${token}`;
      const from = this.configService.get<string>('email.from');

      if (!from) {
        throw new Error('Email sender address is not configured');
      }

      await this.transporter.sendMail({
        from,
        to: email,
        subject: 'Reset your password',
        html: `
          <h1>Password Reset</h1>
          <p>You requested a password reset. Click the link below to set a new password:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>If you did not request this, you can ignore this email.</p>
          <p>This link will expire in 24 hours.</p>
        `,
      });

      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}:`,
        error,
      );
      throw new Error('Failed to send password reset email');
    }
  }

// ...existing code...
}
