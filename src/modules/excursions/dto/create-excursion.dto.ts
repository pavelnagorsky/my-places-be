import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { TravelModesEnum } from "../../routes/enums/travel-modes.enum";
import { CreateExcursionPlaceDto } from "./create-excursion-place.dto";
import { ExcursionTypesEnum } from "../enums/excursion-types.enum";

export class CreateExcursionDto {
  @ApiProperty({ type: String, description: "Excursion title" })
  @Transform(({ value }) => value.trim())
  @IsString()
  @MaxLength(500)
  title: string;

  @ApiProperty({ type: String, description: "Excursion description" })
  @Transform(({ value }) => value.trim())
  @IsString()
  description: string;

  @ApiProperty({
    type: CreateExcursionPlaceDto,
    description: "Excursion places",
    isArray: true,
  })
  @ArrayMinSize(2, { message: "Minimum 2 waypoints required" })
  @ArrayMaxSize(27, {
    message: "Maximum 25 waypoints (+ origin and destination)",
  })
  places: CreateExcursionPlaceDto[];

  @ApiProperty({
    enum: TravelModesEnum,
    description: "Travel mode",
    default: TravelModesEnum.DRIVING,
  })
  @IsEnum(TravelModesEnum)
  travelMode: TravelModesEnum;

  @ApiProperty({
    enum: ExcursionTypesEnum,
    description: "Excursion type",
    default: ExcursionTypesEnum.Overview,
  })
  @IsEnum(ExcursionTypesEnum)
  type: ExcursionTypesEnum;

  @ApiProperty({
    type: Number,
    nullable: true,
    description: "Excursion region ID",
  })
  @IsOptional()
  @IsNumber()
  regionId: number | null;

  @ApiProperty({
    type: Number,
    nullable: true,
    description: "Excursion city ID",
  })
  @IsOptional()
  @IsNumber()
  cityId?: number | null;
}
