import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ title: 'First Name', type: String, default: 'John' })
  firstName: string;

  @ApiProperty({ title: 'Last Name', type: String, default: 'Doe' })
  lastName: string;

  @ApiProperty({ title: 'Email', type: String, default: 'johndoe@gmail.com' })
  email: string;

  @ApiProperty({ title: 'Password', type: String, default: 'password' })
  password: string;
}
