import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ title: 'Text', type: String })
  @IsString()
  @MaxLength(700)
  text: string;
}
