import { Column, Entity, Index, ManyToOne } from "typeorm";
import { TranslationBaseEntity } from "../../../../AI/translations/entities/translation-base.entity";
import { ITranslation } from "../../../../AI/translations/interfaces/translation.interface";
import { Language } from "../../../../languages/entities/language.entity";
import { City } from "./city.entity";

@Entity()
export class CityTranslation
  extends TranslationBaseEntity
  implements ITranslation
{
  @Index()
  @Column({ type: "varchar", length: 300, nullable: true })
  title: string;

  @ManyToOne(() => Language, (language) => language.placeTranslations)
  language: Language;

  @ManyToOne(() => City, (city) => city.translations, {
    onDelete: "CASCADE",
  })
  city: City;
}
