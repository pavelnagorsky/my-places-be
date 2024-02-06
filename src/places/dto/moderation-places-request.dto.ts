import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsString,
  ValidateIf,
} from 'class-validator';
import { ModerationPlacesOrderByEnum } from '../enums/moderation-places-order-by.enum';

export class ModerationPlacesRequestDto {
  @ApiProperty({ type: Number, description: 'Last pagination index' })
  @IsNumber()
  lastIndex: number;
  @ApiProperty({ type: Number, description: 'Items per page' })
  @IsNumber()
  itemsPerPage: number;
  @ApiProperty({ type: String, description: 'Update At date from' })
  @IsDateString()
  @ValidateIf((object, value) => Boolean(value))
  dateFrom?: string | null;
  @ApiProperty({ type: String, description: 'Update At date to' })
  @IsDateString()
  @ValidateIf((object, value) => Boolean(value))
  dateTo?: string | null;
  @ApiProperty({ type: String, description: 'Search' })
  @IsString()
  @ValidateIf((object, value) => Boolean(value))
  search?: string;
  @ApiProperty({ type: String, description: 'Author email' })
  @IsString()
  @ValidateIf((object, value) => Boolean(value))
  authorEmail?: string;
  @ApiProperty({ enum: ModerationPlacesOrderByEnum, description: 'Order by' })
  @IsNumber()
  @ValidateIf((object, value) => Boolean(value))
  orderBy?: ModerationPlacesOrderByEnum;
  @ApiProperty({ type: Boolean, description: 'Is order direction ASC' })
  @IsBoolean()
  @ValidateIf((object, value) => Boolean(value))
  orderAsc?: boolean;
}
