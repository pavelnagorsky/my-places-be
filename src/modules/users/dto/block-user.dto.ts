import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString } from 'class-validator';

export class BlockUserDto {
  @ApiProperty({ description: 'reason', type: String, required: true })
  @IsString()
  reason: string;

  @ApiProperty({ description: 'blockEnd', type: String, required: true })
  @IsDateString()
  blockEnd: string;
}
