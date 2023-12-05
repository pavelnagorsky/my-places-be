import { ApiProperty } from '@nestjs/swagger';
import { MyPlaceDto } from './my-place.dto';
import { Place } from '../entities/place.entity';

export class MyPlacesResponseDto {
  @ApiProperty({ type: MyPlaceDto, isArray: true })
  data: MyPlaceDto[];

  @ApiProperty({ type: Boolean })
  hasMore: boolean;

  @ApiProperty({ type: Number })
  lastIndex: number;

  constructor(data: Place[], lastIndex: number, hasMore: boolean) {
    this.data = data.map((p) => new MyPlaceDto(p));
    this.lastIndex = lastIndex;
    this.hasMore = hasMore;
  }
}
