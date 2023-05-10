import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ title: 'Email', type: String, default: 'johndoe@gmail.com' })
  email: string;

  @ApiProperty({ title: 'Password', type: String, default: 'password' })
  password: string;
}
