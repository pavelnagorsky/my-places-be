import { PaginationResponseDto } from '../../shared/dto/pagination-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { UserShortInfoDto } from './user-short-info.dto';
import { User } from '../entities/user.entity';

export class UsersResponseDto extends PaginationResponseDto {
  @ApiProperty({ type: UserShortInfoDto, isArray: true })
  items: UserShortInfoDto[];

  constructor(
    data: User[],
    pagination: {
      requestedPage: number;
      pageSize: number;
      totalItems: number;
    },
  ) {
    super(pagination.requestedPage, pagination.pageSize, pagination.totalItems);
    this.items = data.map((u) => new UserShortInfoDto(u));
  }
}
