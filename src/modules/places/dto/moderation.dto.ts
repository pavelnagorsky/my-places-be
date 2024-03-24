import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString, ValidateIf } from 'class-validator';

export class ModerationDto {
  @ApiProperty({ type: Boolean, description: 'Moderation action' })
  @IsBoolean()
  accept: boolean;

  @ApiProperty({
    type: String,
    description: 'Moderation rejection feedback',
    required: false,
  })
  @ValidateIf((object, value) => {
    return !object.accept;
  })
  @IsString()
  feedback?: string;
}
