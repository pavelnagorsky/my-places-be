import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MaxLength } from 'class-validator';
import { regularExpressions } from '../../shared/regular-expressions';

export class CreateUserDto {
  @ApiProperty({ title: 'First Name', type: String, default: 'John' })
  @IsString()
  @MaxLength(30)
  firstName: string;

  @ApiProperty({ title: 'Last Name', type: String, default: 'Doe' })
  @IsString()
  @MaxLength(30)
  lastName: string;

  @ApiProperty({ title: 'Email', type: String, default: 'johndoe@gmail.com' })
  @IsEmail()
  @MaxLength(30)
  email: string;

  @ApiProperty({ title: 'Password', type: String, default: 'password' })
  @IsString()
  @Matches(regularExpressions.password)
  password: string;
}
