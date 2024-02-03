import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsString, ValidateIf } from 'class-validator';
import { UserRequestTypesEnum } from '../enums/user-request-types.enum';

export class CreateFeedbackDto {
  @ApiProperty({ title: 'Full name', type: String })
  @IsString()
  fullName: string;

  @ApiProperty({ title: 'Email', type: String })
  @IsEmail()
  email: string;

  @ApiProperty({ title: 'User request type', enum: UserRequestTypesEnum })
  @IsIn([UserRequestTypesEnum.USER, UserRequestTypesEnum.COMPANY])
  userType: UserRequestTypesEnum;

  @ApiProperty({ title: 'Phone', type: String, required: false })
  @IsString()
  @ValidateIf((object, value) => Boolean(value))
  phone: string;

  @ApiProperty({ title: 'Message', type: String })
  @IsString()
  message: string;
}
