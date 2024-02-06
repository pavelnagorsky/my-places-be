import { ApiProperty } from '@nestjs/swagger';
import { Place } from '../entities/place.entity';
import { ModerationPlaceDto } from './moderation-place.dto';

export class ModerationPlacesResponseDto {
  @ApiProperty({ type: ModerationPlaceDto, isArray: true })
  data: ModerationPlaceDto[];

  @ApiProperty({ type: Boolean })
  hasMore: boolean;

  @ApiProperty({ type: Number })
  lastIndex: number;

  constructor(data: Place[], lastIndex: number, hasMore: boolean) {
    this.data = data.map((p) => new ModerationPlaceDto(p));
    this.lastIndex = lastIndex;
    this.hasMore = hasMore;
  }
}
