import { ApiProperty } from '@nestjs/swagger';

export class CreatePlaceTypeDto {
  @ApiProperty({ title: 'Place type title', type: String })
  title: string;

  @ApiProperty({
    title: 'Place type is commercial',
    type: Boolean,
    default: false,
  })
  commercial: boolean;

  @ApiProperty({ title: 'Place type image', type: Number, required: false })
  imageId?: number;
}
