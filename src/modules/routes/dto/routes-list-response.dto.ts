import { ApiProperty } from '@nestjs/swagger';
import { PaginationResponseDto } from '../../../shared/dto/pagination-response.dto';
import { RouteDto } from './route.dto';
import { Route } from '../entities/route.entity';

export class RoutesListResponseDto extends PaginationResponseDto {
  @ApiProperty({ type: RouteDto, isArray: true })
  items: RouteDto[];

  constructor(
    data: Route[],
    pagination: {
      requestedPage: number;
      pageSize: number;
      totalItems: number;
    },
  ) {
    super(pagination.requestedPage, pagination.pageSize, pagination.totalItems);
    this.items = data.map((route) => new RouteDto(route));
  }
}
