import { ITranslation } from "../../translations/interfaces/translation.interface";
import { Column, Entity, Index, ManyToOne } from "typeorm";
import { Language } from "../../languages/entities/language.entity";
import { TranslationBaseEntity } from "../../translations/entities/translation-base.entity";
import { ExcursionPlace } from "./excursion-place.entity";

@Entity()
export class ExcursionPlaceTranslation
  extends TranslationBaseEntity
  implements ITranslation
{
  @Index()
  @Column({ type: "varchar", length: 700, nullable: true })
  description: string;

  @ManyToOne(() => Language, (language) => language.reviewTranslations)
  language: Language;

  @ManyToOne(
    () => ExcursionPlace,
    (excursionPlace) => excursionPlace.translations,
    {
      onDelete: "CASCADE",
    }
  )
  excursionPlace: ExcursionPlace;
}
