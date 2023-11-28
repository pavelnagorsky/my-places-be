import { TranslationBaseEntity } from '../../translations/entities/translation-base.entity';
import { Entity, ManyToOne } from 'typeorm';
import { PlaceCategory } from './place-category.entity';
import { Language } from '../../languages/entities/language.entity';
import { ITranslation } from '../../translations/interfaces/translation.interface';

@Entity()
export class PlaceCategoryTitleTranslation
  extends TranslationBaseEntity
  implements ITranslation
{
  @ManyToOne(() => Language, (language) => language.id)
  language: Language;

  @ManyToOne(() => PlaceCategory, (placeCategory) => placeCategory.titles, {
    onDelete: 'CASCADE',
  })
  placeCategory: PlaceCategory;
}
