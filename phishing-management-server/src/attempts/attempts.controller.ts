import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('attempts')
@UseGuards(JwtAuthGuard)
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Get()
  async getAll() {
    return this.attemptsService.getAllAttempts();
  }

  @Post('send')
  async send(
    @Body() body: { email: string; subject?: string; content?: string },
  ) {
    return this.attemptsService.sendAttempt(body);
  }
}
