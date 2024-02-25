import { ApiProperty } from '@nestjs/swagger';
import { MyPlaceDto } from './my-place.dto';
import { Place } from '../entities/place.entity';
import { PaginationResponseDto } from '../../shared/dto/pagination-response.dto';

export class MyPlacesResponseDto extends PaginationResponseDto {
  @ApiProperty({ type: MyPlaceDto, isArray: true })
  items: MyPlaceDto[];

  constructor(
    data: Place[],
    pagination: {
      requestedPage: number;
      pageSize: number;
      totalItems: number;
    },
  ) {
    super(pagination.requestedPage, pagination.pageSize, pagination.totalItems);
    this.items = data.map((p) => new MyPlaceDto(p));
  }
}
