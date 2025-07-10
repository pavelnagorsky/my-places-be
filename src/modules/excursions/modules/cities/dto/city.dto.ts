import { Exclude, Expose, Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { CityTranslation } from "../entities/city-translation.entity";
import { City } from "../entities/city.entity";

export class CityDto {
  @ApiProperty({ title: "City id", type: Number })
  id: number;

  @Exclude()
  translations: CityTranslation[];

  @ApiProperty({ title: "City title", type: String })
  @Expose()
  get title(): string {
    return this.translations[0]?.title || "";
  }

  constructor(partial: Partial<City>, languageId?: number) {
    Object.assign(this, partial);
    if (languageId) {
      this.translations = this.translations.filter(
        (t) => t.language?.id === languageId
      );
    }
  }
}
