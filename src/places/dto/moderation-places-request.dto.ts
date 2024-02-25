import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, ValidateIf } from 'class-validator';
import { ModerationPlacesOrderByEnum } from '../enums/moderation-places-order-by.enum';
import { PaginationRequestDto } from '../../shared/dto/pagination-request.dto';

export class ModerationPlacesRequestDto extends PaginationRequestDto<ModerationPlacesOrderByEnum> {
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
}
