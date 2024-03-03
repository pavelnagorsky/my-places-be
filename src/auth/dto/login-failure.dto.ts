import { ApiProperty } from '@nestjs/swagger';
import LoginErrorEnum from '../enums/login-error.enum';

export class LoginFailureDto {
  @ApiProperty({ type: String, description: 'message' })
  message: string;
  @ApiProperty({ enum: LoginErrorEnum, description: 'client message ' })
  loginError: LoginErrorEnum;
  @ApiProperty({
    type: Date,
    nullable: true,
    description: 'Blocked until',
  })
  blockedUntil?: Date | null;

  constructor(partial: Partial<LoginFailureDto>) {
    Object.assign(this, partial);
  }
}
