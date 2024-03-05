import { PaginationRequestDto } from '../../shared/dto/pagination-request.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsString, ValidateIf } from 'class-validator';
import { CrmStatusesEnum } from '../../shared/enums/crm-statuses.enum';
import { UserRequestTypesEnum } from '../enums/user-request-types.enum';

export class FeedbackListRequestDto extends PaginationRequestDto {
  @ApiProperty({ type: String, description: 'Created At date from' })
  @IsDateString()
  @ValidateIf((object, value) => Boolean(value))
  dateFrom?: string | null;
  @ApiProperty({ type: String, description: 'Created At date to' })
  @IsDateString()
  @ValidateIf((object, value) => Boolean(value))
  dateTo?: string | null;
  @ApiProperty({ type: String, description: 'Author email' })
  @IsString()
  @ValidateIf((object, value) => Boolean(value))
  authorEmail?: string;
  @ApiProperty({
    enum: CrmStatusesEnum,
    isArray: true,
    description: 'statuses',
  })
  @IsNumber({}, { each: true })
  @ValidateIf((object, value) => Boolean(value))
  statuses?: CrmStatusesEnum[];
  @ApiProperty({
    enum: UserRequestTypesEnum,
    isArray: true,
    description: 'user request types',
  })
  @IsNumber({}, { each: true })
  @ValidateIf((object, value) => Boolean(value))
  requestTypes?: UserRequestTypesEnum[];
}
