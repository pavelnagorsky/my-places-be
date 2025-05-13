import { Column, Entity, Index, ManyToOne } from "typeorm";
import { TranslationBaseEntity } from "../../translations/entities/translation-base.entity";
import { ITranslation } from "../../translations/interfaces/translation.interface";
import { Language } from "../../languages/entities/language.entity";
import { Region } from "./region.entity";

@Entity()
export class RegionTranslation
  extends TranslationBaseEntity
  implements ITranslation
{
  @Index()
  @Column({ type: "varchar", length: 300, nullable: true })
  title: string;

  @ManyToOne(() => Language, (language) => language.placeTranslations)
  language: Language;

  @ManyToOne(() => Region, (region) => region.translations, {
    onDelete: "CASCADE",
  })
  region: Region;
}
