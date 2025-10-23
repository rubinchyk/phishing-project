import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { PhishingService } from './phishing.service';

@Controller('phishing')
export class PhishingController {
  constructor(private readonly service: PhishingService) {}

  @Post('send')
  async send(
    @Body() body: { email: string; subject?: string; content?: string },
  ) {
    const attempt = await this.service.sendPhishing({
      email: body.email,
      subject: body.subject,
      content: body.content,
    });
    return attempt;
  }

  @Get('click/:id')
  @HttpCode(200)
  async click(@Param('id') id: string, @Query('t') token?: string) {
    const ok = await this.service.recordClick(id, token);
    return ok ? 'Recorded' : 'Recorded';
  }
}
