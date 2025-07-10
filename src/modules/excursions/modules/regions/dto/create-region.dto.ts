import { ApiProperty } from "@nestjs/swagger";
import { RegionTranslationDto } from "./region-translation.dto";
import { IsArray, ValidateNested } from "class-validator";

export class CreateRegionDto {
  @ApiProperty({
    title: "Region title",
    type: RegionTranslationDto,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  titleTranslations: RegionTranslationDto[];
}
