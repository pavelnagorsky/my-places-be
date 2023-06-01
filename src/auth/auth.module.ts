import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IJwtConfig } from '../config/configuration';
import { UserFromTokenPipe } from './pipes/user-from-token.pipe';
import { MailingModule } from '../mailing/mailing.module';
import { PayloadFromTokenPipe } from './pipes/payload-from-token.pipe';

@Global()
@Module({
  imports: [
    UsersModule,
    MailingModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<IJwtConfig>('jwt')?.secret,
        global: true,
        signOptions: {
          expiresIn: configService.get<IJwtConfig>('jwt')?.expirationTime,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserFromTokenPipe, PayloadFromTokenPipe],
  exports: [AuthService, JwtModule, UserFromTokenPipe, UsersModule],
})
export class AuthModule {}
