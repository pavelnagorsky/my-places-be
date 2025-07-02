import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsString, MaxLength } from "class-validator";
import { StatisticEntitiesEnum } from "../enums/statistic-entities.enum";

export class CreateReportDto {
  @ApiProperty({ title: "Text", type: String })
  @IsString()
  @MaxLength(500)
  text: string;

  @ApiProperty({ title: "Entity id", type: Number })
  @IsNumber()
  entityId: number;

  @ApiProperty({ title: "Entity type", enum: StatisticEntitiesEnum })
  @IsEnum(StatisticEntitiesEnum)
  entityType: StatisticEntitiesEnum;
}
