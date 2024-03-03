import { UnauthorizedException } from '@nestjs/common';
import { LoginFailureDto } from '../dto/login-failure.dto';

export class LoginException extends UnauthorizedException {
  constructor(dto: LoginFailureDto) {
    super(dto);
  }
}
