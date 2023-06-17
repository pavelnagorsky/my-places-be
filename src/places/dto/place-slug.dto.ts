import { ApiProperty } from '@nestjs/swagger';

export class PlaceSlugDto {
  @ApiProperty({ title: 'Place id', type: Number })
  id: number;

  @ApiProperty({ type: String, description: 'Place url path' })
  slug: string;
}
