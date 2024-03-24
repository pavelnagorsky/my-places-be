import { Injectable, Logger } from '@nestjs/common';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailingService {
  constructor(private readonly mailerService: MailerService) {}
  private logger = new Logger();

  async sendEmail(email: ISendMailOptions) {
    this.mailerService
      .sendMail(email)
      .then(() => {
        this.logger.log('Sent email', email.to, email.subject);
      })
      .catch((e) => {
        this.logger.error('Failed to send email', e);
      });
  }
}
