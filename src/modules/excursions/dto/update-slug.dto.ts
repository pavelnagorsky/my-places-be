import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import { regularExpressions } from '../../../shared/regular-expressions';

export class UpdateSlugDto {
  @ApiProperty({ type: String, description: 'Excursion url path' })
  @Matches(regularExpressions.slugPattern)
  slug: string;
}
