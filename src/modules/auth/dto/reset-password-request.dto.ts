import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength } from 'class-validator';

export class ResetPasswordRequestDto {
  @ApiProperty({ title: 'Email', type: String, default: 'johndoe@gmail.com' })
  @IsEmail()
  @MaxLength(60)
  email: string;
}
