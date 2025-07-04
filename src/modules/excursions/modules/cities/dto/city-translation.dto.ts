import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, MaxLength } from "class-validator";

export class CityTranslationDto {
  @ApiProperty({
    title: "Language id",
    type: Number,
  })
  @IsNumber()
  langId: number;

  @ApiProperty({
    title: "Text",
    type: String,
  })
  @IsString()
  @MaxLength(300)
  text: string;
}
