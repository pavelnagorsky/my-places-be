import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SaveModeratorDto {
  @ApiProperty({ description: 'phone', type: String, required: true })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'address', type: String, required: true })
  @IsString()
  address: string;
}
