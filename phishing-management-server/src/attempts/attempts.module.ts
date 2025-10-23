import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AttemptsController } from './attempts.controller';
import { AttemptsService } from './attempts.service';
import { Attempt, AttemptSchema } from '../schemas/attempt.schema';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    MongooseModule.forFeature([{ name: Attempt.name, schema: AttemptSchema }]),
  ],
  controllers: [AttemptsController],
  providers: [AttemptsService],
})
export class AttemptsModule {}
