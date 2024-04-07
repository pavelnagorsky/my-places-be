import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Matches, MaxLength } from 'class-validator';
import { regularExpressions } from '../../../shared/regular-expressions';

export class LoginDto {
  @ApiProperty({ title: 'Email', type: String, default: 'johndoe@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ title: 'Password', type: String, default: 'password' })
  @MaxLength(50)
  @Matches(regularExpressions.password)
  password: string;
}
