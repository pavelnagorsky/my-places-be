import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IMailerConfig } from '../../config/configuration';
import { MailingService } from './mailing.service';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: `smtps://${
          configService.get<IMailerConfig>('emailConfig')?.email
        }:${
          configService.get<IMailerConfig>('emailConfig')?.emailPw
        }@smtp.gmail.com`,
        template: {
          dir: join(__dirname, 'public/templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailingService],
  exports: [MailingService],
})
export class MailingModule {}
