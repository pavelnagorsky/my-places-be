import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Transform } from "class-transformer";
import { TranslationDto } from "../../../../translations/dto/translation.dto";
import { Region } from "../entities/region.entity";
import { RegionTranslation } from "../entities/region-translation.entity";

export class RegionAdminDto {
  @ApiProperty({ title: "Region id", type: Number })
  id: number;

  @ApiProperty({
    title: "Region title",
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
  translations: RegionTranslation[];

  constructor(partial: Partial<Region>) {
    Object.assign(this, partial);
  }
}
