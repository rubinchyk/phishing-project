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

/**
 * Controller for phishing simulation endpoints: sending emails and recording clicks.
 */
@Controller('phishing')
export class PhishingController {
  constructor(private readonly service: PhishingService) {}

  /**
   * Sends a phishing simulation email to the specified recipient.
   */
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

  /**
   * Records a click event when a recipient clicks the phishing link.
   * Validates the token to prevent unauthorized updates.
   */
  @Get('click/:id')
  @HttpCode(200)
  async click(@Param('id') id: string, @Query('t') token?: string) {
    const ok = await this.service.recordClick(id, token);
    return ok ? 'Recorded' : 'Recorded';
  }
}
