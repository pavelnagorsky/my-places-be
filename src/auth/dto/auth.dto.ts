import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  @ApiProperty({ description: 'JWT Token', type: String })
  token: string;

  constructor(token: string) {
    this.token = token;
  }
}
