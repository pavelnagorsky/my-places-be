import { ApiProperty } from "@nestjs/swagger";
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsString,
  ValidateIf,
} from "class-validator";
import { CrmStatusesEnum } from "../../../shared/enums/crm-statuses.enum";
import { ReportsOrderByEnum } from "../enums/reports-order-by.enum";
import { PaginationRequestDto } from "../../../shared/dto/pagination-request.dto";
import { StatisticEntitiesEnum } from "../enums/statistic-entities.enum";

export class ReportsRequestDto extends PaginationRequestDto<ReportsOrderByEnum> {
  @ApiProperty({ type: String, description: "Created At date from" })
  @IsDateString()
  @ValidateIf((object, value) => Boolean(value))
  dateFrom?: string | null;
  @ApiProperty({ type: String, description: "Created At date to" })
  @IsDateString()
  @ValidateIf((object, value) => Boolean(value))
  dateTo?: string | null;
  @ApiProperty({ type: String, description: "Search" })
  @IsString()
  @ValidateIf((object, value) => Boolean(value))
  search?: string;
  @ApiProperty({
    enum: CrmStatusesEnum,
    isArray: true,
    description: "statuses",
  })
  @IsNumber({}, { each: true })
  @ValidateIf((object, value) => Boolean(value))
  statuses?: CrmStatusesEnum[];
  @ApiProperty({
    enum: StatisticEntitiesEnum,
    isArray: true,
    description: "Entity types",
  })
  @IsEnum(StatisticEntitiesEnum, { each: true })
  @ValidateIf((object, value) => Boolean(value))
  entityTypes?: StatisticEntitiesEnum[];
}
