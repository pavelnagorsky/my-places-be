import { MyPlacesOrderByEnum } from '../enums/my-places-order-by.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsString, ValidateIf } from 'class-validator';
import { PlaceStatusesEnum } from '../enums/place-statuses.enum';
import { PaginationRequestDto } from '../../shared/dto/pagination-request.dto';

export class MyPlacesRequestDto extends PaginationRequestDto<MyPlacesOrderByEnum> {
  @ApiProperty({ type: String, description: 'Date from' })
  @IsDateString()
  @ValidateIf((object, value) => Boolean(value))
  dateFrom?: string | null;
  @ApiProperty({ type: String, description: 'Date to' })
  @IsDateString()
  @ValidateIf((object, value) => Boolean(value))
  dateTo?: string | null;
  @ApiProperty({ type: String, description: 'Search' })
  @IsString()
  @ValidateIf((object, value) => Boolean(value))
  search?: string;
  @ApiProperty({
    enum: PlaceStatusesEnum,
    isArray: true,
    description: 'Statuses',
  })
  @IsNumber({}, { each: true })
  @ValidateIf((object, value) => Boolean(value))
  statuses?: PlaceStatusesEnum[];
}
