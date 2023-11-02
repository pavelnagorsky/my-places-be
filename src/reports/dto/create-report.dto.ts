import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({ title: 'Text', type: String })
  @IsString()
  @MaxLength(500)
  text: string;

  @ApiProperty({ title: 'Place id', type: Number })
  @IsNumber()
  placeId: number;
}
