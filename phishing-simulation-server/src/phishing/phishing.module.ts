import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { PhishingController } from './phishing.controller';
import { PhishingService } from './phishing.service';
import { Attempt, AttemptSchema } from '../schemas/attempt.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Attempt.name, schema: AttemptSchema }]),
  ],
  controllers: [PhishingController],
  providers: [PhishingService],
})
export class PhishingModule {}
