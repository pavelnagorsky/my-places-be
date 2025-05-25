import { Global, Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UsersModule } from "../users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { UserFromTokenPipe } from "./pipes/user-from-token.pipe";
import { MailingModule } from "../mailing/mailing.module";
import { PayloadFromTokenPipe } from "./pipes/payload-from-token.pipe";
import { JwtRefreshTokenStrategy } from "./strategy/jwt-refresh-token.strategy";
import { JwtAccessTokenStrategy } from "./strategy/jwt-access-token.strategy";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RefreshTokenEntity } from "./entities/refresh-token.entity";
import { JwtEmailTokenStrategy } from "./strategy/jwt-email-token.strategy";
import { JwtResetPasswordStrategy } from "./strategy/jwt-reset-password.strategy";
import { GoogleOAuthOneTapStrategy } from "./strategy/google-one-tap.strategy";
import { GoogleOAuthStrategy } from "./strategy/google.strategy";

@Global()
@Module({
  imports: [
    UsersModule,
    MailingModule,
    JwtModule.register({ global: true }),
    TypeOrmModule.forFeature([RefreshTokenEntity]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserFromTokenPipe,
    PayloadFromTokenPipe,
    JwtRefreshTokenStrategy,
    JwtAccessTokenStrategy,
    JwtEmailTokenStrategy,
    JwtResetPasswordStrategy,
    GoogleOAuthOneTapStrategy,
    GoogleOAuthStrategy,
  ],
  exports: [AuthService, JwtModule, UserFromTokenPipe, UsersModule],
})
export class AuthModule {}
