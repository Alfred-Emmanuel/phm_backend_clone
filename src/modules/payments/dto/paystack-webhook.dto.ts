import { ApiProperty } from '@nestjs/swagger';

export class PaystackWebhookEventData {
  @ApiProperty({ example: 'paystack_ref', description: 'Paystack payment reference' })
  reference: string;

  @ApiProperty({ example: 'success', description: 'Status of the payment' })
  status: string;

  // Additional dynamic fields can be present
}

export class PaystackWebhookEvent {
  @ApiProperty({ example: 'charge.success', description: 'Type of Paystack event' })
  event: string;

  @ApiProperty({ type: PaystackWebhookEventData, description: 'Event data payload' })
  data: PaystackWebhookEventData;

  // Additional dynamic fields can be present
}
