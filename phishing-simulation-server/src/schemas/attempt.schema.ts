import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/**
 * Mongoose document type for Attempt with hydrated methods.
 */
export type AttemptDocument = HydratedDocument<Attempt>;

/**
 * Represents a phishing simulation attempt sent to a target email.
 * Tracks delivery status and click events.
 */
@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'attempts',
})
export class Attempt {
  @Prop({ required: true })
  email: string;

  @Prop()
  subject?: string;

  @Prop()
  content?: string;

  @Prop({ enum: ['pending', 'sent', 'clicked', 'failed'], default: 'pending' })
  status: 'pending' | 'sent' | 'clicked' | 'failed';

  @Prop()
  sentAt?: Date;

  @Prop()
  clickedAt?: Date;

  /**
   * Expiration timestamp for the click token. After this time, the link is invalid.
   */
  @Prop()
  expiresAt?: Date;

  /**
   * ⚠️ Sensitive: Token used to verify click authenticity. Never expose in API responses.
   */
  @Prop({ select: false })
  clickToken?: string;
}

export const AttemptSchema = SchemaFactory.createForClass(Attempt);
