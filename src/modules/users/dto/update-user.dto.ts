import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class UpdateUserDto {
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

  @ApiProperty({ title: 'Receive emails', type: Boolean })
  @IsBoolean()
  receiveEmails: boolean;

  @ApiProperty({
    title: 'Preferred language id',
    type: Number,
    default: 1,
    nullable: true,
  })
  @IsNumber()
  @ValidateIf((object, value) => !!value)
  preferredLanguageId?: number;
}
