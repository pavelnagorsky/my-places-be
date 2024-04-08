import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength } from 'class-validator';
import { regularExpressions } from '../../../shared/regular-expressions';

export class ResetPasswordDto {
  @ApiProperty({ title: 'Password', type: String, default: 'password' })
  @IsString()
  @MaxLength(50)
  @Matches(regularExpressions.password)
  password: string;
}
