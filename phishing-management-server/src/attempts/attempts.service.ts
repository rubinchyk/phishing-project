import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Attempt, AttemptDocument } from '../schemas/attempt.schema';

/**
 * DTO for sending a phishing attempt via the simulation server.
 */
interface SendAttemptDto {
  email: string;
  subject?: string;
  content?: string;
}

/**
 * Service for managing phishing attempts: fetching from DB and proxying send requests to simulation server.
 */
@Injectable()
export class AttemptsService {
  private readonly simulationUrl: string;

  constructor(
    @InjectModel(Attempt.name) private attemptModel: Model<AttemptDocument>,
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {
    // Internal URL for communication with the simulation server.
    this.simulationUrl =
      this.config.get<string>('SIMULATION_SERVER_URL') ??
      'http://localhost:3001';
  }

  /**
   * Retrieves all phishing attempts from MongoDB, sorted by creation date (newest first).
   */
  async getAllAttempts(): Promise<Attempt[]> {
    return this.attemptModel.find().sort({ createdAt: -1 }).exec();
  }

  /**
   * Proxies a send request to the simulation server and returns the created attempt.
   */
  async sendAttempt(dto: SendAttemptDto): Promise<Attempt> {
    const url = `${this.simulationUrl}/phishing/send`;
    const response = await firstValueFrom(
      this.httpService.post<Attempt>(url, dto),
    );
    return response.data;
  }
}
