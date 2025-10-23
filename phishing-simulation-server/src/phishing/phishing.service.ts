import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attempt, AttemptDocument } from '../schemas/attempt.schema';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { randomBytes } from 'crypto';

interface SendPhishingDto {
  email: string;
  subject?: string;
  content?: string;
}

@Injectable()
export class PhishingService {
  private readonly transporter: Transporter;
  private readonly fromEmail: string;
  private readonly baseUrl: string;

  constructor(
    @InjectModel(Attempt.name) private attemptModel: Model<AttemptDocument>,
    private readonly config: ConfigService,
  ) {
    this.fromEmail =
      this.config.get<string>('FROM_EMAIL') ?? 'no-reply@example.com';
    this.baseUrl =
      this.config.get<string>('BASE_URL') ?? 'http://localhost:3001';

    const transporter: Transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST'),
      port: Number(this.config.get<string>('SMTP_PORT') ?? 587),
      secure: false,
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });

    this.transporter = transporter;
  }

  async sendPhishing(dto: SendPhishingDto): Promise<Attempt> {
    const clickToken = randomBytes(16).toString('hex');

    const attempt = await this.attemptModel.create({
      email: dto.email,
      subject: dto.subject,
      content: dto.content,
      status: 'pending',
      clickToken,
    });

    const clickUrl = `${this.baseUrl}/phishing/click/${attempt.id}?t=${clickToken}`;
    const subject = dto.subject ?? 'Security Awareness Test';
    const text =
      dto.content ??
      `This is a phishing simulation. Please do not share this link.\n\nClick here: ${clickUrl}`;
    const html = dto.content
      ? `${dto.content}<br/><br/><a href="${clickUrl}">Click here</a>`
      : `This is a phishing simulation. Please do not share this link.<br/><br/><a href="${clickUrl}">Click here</a>`;

    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to: dto.email,
        subject,
        text,
        html,
      });

      attempt.status = 'sent';
      attempt.sentAt = new Date();
      await attempt.save();
    } catch (e) {
      attempt.status = 'failed';
      await attempt.save();
      throw e;
    }

    return attempt.toObject();
  }

  async recordClick(id: string, token?: string): Promise<boolean> {
    if (!token) return false;
    const attempt = await this.attemptModel.findById(id).select('+clickToken');
    if (!attempt) return false;
    if (attempt.clickToken !== token) return false;

    attempt.status = 'clicked';
    attempt.clickedAt = new Date();
    await attempt.save();
    return true;
  }
}
