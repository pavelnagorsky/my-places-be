import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import { regularExpressions } from '../../shared/regular-expressions';

export class CreateSlugDto {
  @ApiProperty({ type: String, description: 'Place url path' })
  @Matches(regularExpressions.slugPattern)
  slug: string;
}
