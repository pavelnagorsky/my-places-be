import { ApiProperty } from "@nestjs/swagger";
import { CityTranslationDto } from "./city-translation.dto";
import { IsArray, ValidateNested } from "class-validator";

export class CreateCityDto {
  @ApiProperty({
    title: "City title",
    type: CityTranslationDto,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  titleTranslations: CityTranslationDto[];
}
