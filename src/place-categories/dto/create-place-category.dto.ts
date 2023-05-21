import { ApiProperty } from '@nestjs/swagger';

export class CreatePlaceCategoryDto {
  @ApiProperty({ title: 'Place category title', type: String })
  title: string;

  @ApiProperty({ title: 'Place category image', type: Number, required: false })
  imageId?: number;
}
