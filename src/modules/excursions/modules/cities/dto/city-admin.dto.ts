import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Transform } from "class-transformer";
import { TranslationDto } from "../../../../translations/dto/translation.dto";
import { City } from "../entities/city.entity";
import { CityTranslation } from "../entities/city-translation.entity";

export class CityAdminDto {
  @ApiProperty({ title: "City id", type: Number })
  id: number;

  @ApiProperty({
    title: "City title",
    type: TranslationDto,
    isArray: true,
  })
  @Expose()
  get titleTranslations(): TranslationDto[] {
    return this.translations.map(
      (t) => new TranslationDto({ ...t, text: t.title })
    );
  }

  @Exclude()
  translations: CityTranslation[];

  constructor(partial: Partial<City>) {
    Object.assign(this, partial);
  }
}
