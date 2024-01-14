import { MyPlacesOrderByEnum } from '../enums/my-places-order-by.enum';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsDateString,
  IsNumber,
  IsString,
  ValidateIf,
} from 'class-validator';
import { PlaceStatusesEnum } from '../enums/place-statuses.enum';

export class MyPlacesRequestDto {
  @ApiProperty({ type: Number, description: 'Last pagination index' })
  @IsNumber()
  lastIndex: number;
  @ApiProperty({ type: Number, description: 'Items per page' })
  @IsNumber()
  itemsPerPage: number;
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
  @ApiProperty({ enum: MyPlacesOrderByEnum, description: 'Order by' })
  @IsNumber()
  @ValidateIf((object, value) => Boolean(value))
  orderBy?: MyPlacesOrderByEnum;
  @ApiProperty({ type: Boolean, description: 'Is order direction ASC' })
  @IsBoolean()
  @ValidateIf((object, value) => Boolean(value))
  orderAsc?: boolean;
}
