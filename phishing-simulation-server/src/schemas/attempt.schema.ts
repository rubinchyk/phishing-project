import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AttemptDocument = HydratedDocument<Attempt>;

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

  @Prop({ select: false })
  clickToken?: string;
}

export const AttemptSchema = SchemaFactory.createForClass(Attempt);
