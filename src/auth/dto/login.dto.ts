import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Matches } from 'class-validator';
import { regularExpressions } from '../../shared/regular-expressions';

export class LoginDto {
  @ApiProperty({ title: 'Email', type: String, default: 'johndoe@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ title: 'Password', type: String, default: 'password' })
  @Matches(regularExpressions.password)
  password: string;
}
