import { AuthGuard } from '@nestjs/passport';

export class JwtEmailGuard extends AuthGuard('email-jwt') {}
