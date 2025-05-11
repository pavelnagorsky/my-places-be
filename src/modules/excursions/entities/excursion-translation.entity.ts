import { ITranslation } from "../../translations/interfaces/translation.interface";
import { Column, Entity, Index, ManyToOne } from "typeorm";
import { Language } from "../../languages/entities/language.entity";
import { TranslationBaseEntity } from "../../translations/entities/translation-base.entity";
import { Excursion } from "./excursion.entity";

@Entity()
export class ExcursionTranslation
  extends TranslationBaseEntity
  implements ITranslation
{
  @Index()
  @Column({ type: "varchar", length: 300, nullable: true })
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @ManyToOne(() => Language, (language) => language.reviewTranslations)
  language: Language;

  @ManyToOne(() => Excursion, (excursion) => excursion.translations, {
    onDelete: "CASCADE",
  })
  excursion: Excursion;
}
