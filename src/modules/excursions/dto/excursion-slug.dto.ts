import { ApiProperty } from '@nestjs/swagger';

export class ExcursionSlugDto {
  @ApiProperty({ title: 'Excursion id', type: Number })
  id: number;

  @ApiProperty({ type: String, description: 'Excursion url path' })
  slug: string;
}
