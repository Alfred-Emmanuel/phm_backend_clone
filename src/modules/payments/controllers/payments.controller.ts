import { Controller, Post, Body, Get, Query, Headers, Req } from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';
import { InitiatePaymentDto } from '../dto/initiate-payment.dto';
import { VerifyPaymentDto } from '../dto/verify-payment.dto';
import { Request } from 'express';
import { PaystackWebhookEvent } from '../dto/paystack-webhook.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate a payment for course enrollment' })
  @ApiBody({
    type: InitiatePaymentDto,
    description: 'Payload to initiate a payment',
    examples: {
      valid: {
        summary: 'Valid Request',
        value: {
          userId: '123e4567-e89b-12d3-a456-426614174000',
          courseId: '987e6543-e21c-65d4-b789-123456789abc',
          amount: 5000,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Payment initiation successful', schema: { example: { authorization_url: 'https://checkout.paystack.com/abc123', reference: 'paystack_ref' } } })
  async initiate(@Body() dto: InitiatePaymentDto) {
    return this.paymentsService.initiatePayment(dto);
  }

  @Get('verify')
  @ApiOperation({ summary: 'Verify a payment by reference' })
  @ApiQuery({ name: 'reference', description: 'Paystack payment reference', example: 'paystack_ref' })
  @ApiResponse({ status: 200, description: 'Payment verified and enrollment completed', schema: { example: { status: 'success' } } })
  @ApiResponse({ status: 400, description: 'Invalid or missing reference' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async verify(@Query('reference') reference: string) {
    return this.paymentsService.verifyPayment(reference);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Paystack webhook endpoint (called by Paystack)' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleWebhook(@Req() req: Request, @Headers('x-paystack-signature') signature: string) {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const crypto = require('crypto');
    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
    if (hash !== signature) {
      return { status: 'error', message: 'Invalid signature' };
    }
    const event = req.body as PaystackWebhookEvent;
    // Defensive: check for reference and status
    if (event.event === 'charge.success' && event.data && event.data.status === 'success' && event.data.reference) {
      try {
        await this.paymentsService.verifyPayment(event.data.reference);
      } catch (error) {
        // Log error, but always return 200 to Paystack
        console.error('Webhook payment verification error:', error);
      }
    }
    return { status: 'ok' };
  }
}
