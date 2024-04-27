import { AbstractEmail } from './abstract.email';
import { EmailDto } from '../../users/dto/email.dto';

export class CustomEmail extends AbstractEmail {
  constructor(dto: EmailDto) {
    super('custom');
    this.to = dto.to;
    this.from = this.supportSender;
    this.subject = dto.subject;

    this.context = {
      title: dto.subject,
      html: dto.text,
    };
  }

  subject: string;
}
