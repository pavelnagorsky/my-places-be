import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { join, resolve } from 'path';

export const MAIL_TEMPLATES_PATH = join(process.cwd(), 'templates/');

// a helper function which generates the full path to the mail template
export const getFullTemplatePath = (templatePath: string): string => {
  return resolve(MAIL_TEMPLATES_PATH, ...templatePath.split('/'));
};

@Injectable()
export class MailingService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmailConfirm(userDto: CreateUserDto, feedbackToken: string) {
    await this.mailerService.sendMail({
      to: [userDto.email], // list of receivers
      subject: 'Email confirm', // Subject line
      template: getFullTemplatePath('users/confirm-email'),
      context: {
        user_firstname: userDto.firstName,
        confirm_link: 'https://my-client-domain/auth/confirm=' + feedbackToken,
      },
    });
  }
}
