import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Matches, ValidateIf } from 'class-validator';
import { regularExpressions } from '../../shared/regular-expressions';

export class CreateSlugDto {
  @ApiProperty({ type: String, description: 'Place url path' })
  @Matches(regularExpressions.slugPattern)
  slug: string;

  @ApiProperty({ type: Number, description: 'Place id', required: false })
  @ValidateIf((object, value) => Boolean(value))
  @IsNumber()
  id?: number;
}
