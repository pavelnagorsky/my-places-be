import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EmailDto {
  @ApiProperty({
    type: String,
    description: 'User email',
  })
  @IsEmail()
  to: string;

  @ApiProperty({
    type: String,
    description: 'Email subject',
  })
  @IsString()
  subject: string;

  @ApiProperty({
    type: String,
    description: 'Email html text',
  })
  @IsString()
  text: string;
}
