import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IMailerConfig } from '../config/configuration';
import { MailingService } from './mailing.service';

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
        defaults: {
          from: `My-Places Support <${
            configService.get<IMailerConfig>('emailConfig')?.email
          }>`,
        },
        template: {
          dir: process.cwd() + '/templates',
          adapter: new EjsAdapter(),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailingService],
  exports: [MailingService],
})
export class MailingModule {}
