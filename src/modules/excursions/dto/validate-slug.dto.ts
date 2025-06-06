import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Matches, ValidateIf } from 'class-validator';
import { regularExpressions } from '../../../shared/regular-expressions';

export class ValidateSlugDto {
  @ApiProperty({ type: String, description: 'Excursion url path' })
  @Matches(regularExpressions.slugPattern)
  slug: string;

  @ApiProperty({ type: Number, description: 'Excursion id', required: false })
  @ValidateIf((object, value) => Boolean(value))
  @IsNumber()
  id?: number;
}
