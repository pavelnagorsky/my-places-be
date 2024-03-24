import { ApiProperty } from '@nestjs/swagger';
import { Image } from '../entities/image.entity';

export class ImageDto {
  @ApiProperty({ title: 'Image id', type: Number })
  id: number;

  @ApiProperty({ title: 'Image url', type: String })
  url: string;

  @ApiProperty({ title: 'Image position', type: Number })
  position: number;

  @ApiProperty({ title: 'Created at', type: Date })
  createdAt: Date;

  constructor(partial: Partial<Image>) {
    Object.assign(this, partial);
  }
}
