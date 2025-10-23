import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/**
 * Mongoose document type for User with hydrated methods.
 */
export type UserDocument = HydratedDocument<User>;

/**
 * Represents an administrator user with authentication credentials.
 */
@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'users',
})
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  /**
   * ⚠️ Sensitive: Bcrypt hash of the user's password. Never expose in API responses.
   */
  @Prop({ required: true, select: false })
  passwordHash: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
