import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Attempt, AttemptDocument } from '../schemas/attempt.schema';

interface SendAttemptDto {
  email: string;
  subject?: string;
  content?: string;
}

@Injectable()
export class AttemptsService {
  private readonly simulationUrl: string;

  constructor(
    @InjectModel(Attempt.name) private attemptModel: Model<AttemptDocument>,
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {
    this.simulationUrl =
      this.config.get<string>('SIMULATION_SERVER_URL') ??
      'http://localhost:3001';
  }

  async getAllAttempts(): Promise<Attempt[]> {
    return this.attemptModel.find().sort({ createdAt: -1 }).exec();
  }

  async sendAttempt(dto: SendAttemptDto): Promise<Attempt> {
    const url = `${this.simulationUrl}/phishing/send`;
    const response = await firstValueFrom(
      this.httpService.post<Attempt>(url, dto),
    );
    return response.data;
  }
}
