import { ApiProperty } from '@nestjs/swagger';
import { Image } from '../entities/image.entity';

export class ImageDto {
  @ApiProperty({ title: 'Image id', type: Number })
  id: number;

  @ApiProperty({ title: 'Image url', type: String })
  url: string;

  constructor(partial: Partial<Image>) {
    Object.assign(this, partial);
  }
}
