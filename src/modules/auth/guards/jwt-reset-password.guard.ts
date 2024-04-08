import { AuthGuard } from '@nestjs/passport';

export class JwtResetPasswordGuard extends AuthGuard('reset-password-jwt') {}
