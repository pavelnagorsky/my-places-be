import { TranslationBaseEntity } from '../../translations/entities/translation-base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { PlaceCategory } from './place-category.entity';
import { Language } from '../../languages/entities/language.entity';
import { ITranslation } from '../../translations/interfaces/translation.interface';

@Entity()
export class PlaceCategoryTranslation
  extends TranslationBaseEntity
  implements ITranslation
{
  @ManyToOne(() => Language, (language) => language.placeCategoryTranslations)
  language: Language;

  @Column({ type: 'varchar', length: 300, nullable: true })
  text: string;

  @ManyToOne(() => PlaceCategory, (placeCategory) => placeCategory.titles, {
    onDelete: 'CASCADE',
  })
  placeCategory: PlaceCategory;
}
