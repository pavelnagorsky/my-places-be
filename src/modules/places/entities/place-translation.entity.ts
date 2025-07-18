import { TranslationBaseEntity } from "../../AI/translations/entities/translation-base.entity";
import { ITranslation } from "../../AI/translations/interfaces/translation.interface";
import { Column, Entity, Index, ManyToOne } from "typeorm";
import { Language } from "../../languages/entities/language.entity";
import { Place } from "./place.entity";

@Entity()
export class PlaceTranslation
  extends TranslationBaseEntity
  implements ITranslation
{
  @Index()
  @Column({ type: "varchar", length: 300, nullable: true })
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "varchar", length: 300, nullable: true })
  address: string;

  @ManyToOne(() => Language, (language) => language.placeTranslations)
  language: Language;

  @ManyToOne(() => Place, (place) => place.translations, {
    onDelete: "CASCADE",
  })
  place: Place;
}
