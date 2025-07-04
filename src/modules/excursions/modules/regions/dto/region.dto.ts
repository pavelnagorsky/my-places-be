import { Exclude, Expose, Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { RegionTranslation } from "../entities/region-translation.entity";
import { Region } from "../entities/region.entity";

export class RegionDto {
  @ApiProperty({ title: "Region id", type: Number })
  id: number;

  @Exclude()
  translations: RegionTranslation[];

  @ApiProperty({ title: "Region title", type: String })
  @Expose()
  get title(): string {
    return this.translations[0]?.title || "";
  }

  constructor(partial: Partial<Region>, languageId?: number) {
    Object.assign(this, partial);
    if (languageId) {
      this.translations = this.translations.filter(
        (t) => t.language?.id === languageId
      );
    }
  }
}
