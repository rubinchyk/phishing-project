import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * Controller for phishing attempts management. All endpoints require JWT authentication.
 */
@Controller('attempts')
@UseGuards(JwtAuthGuard)
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  /**
   * Retrieves all phishing attempts from the database.
   */
  @Get()
  async getAll() {
    return this.attemptsService.getAllAttempts();
  }

  /**
   * Sends a phishing attempt by proxying the request to the simulation server.
   */
  @Post('send')
  async send(
    @Body() body: { email: string; subject?: string; content?: string },
  ) {
    return this.attemptsService.sendAttempt(body);
  }
}
