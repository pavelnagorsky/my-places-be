import { TranslationBaseEntity } from '../../translations/entities/translation-base.entity';
import { Entity, ManyToOne } from 'typeorm';
import { PlaceType } from './place-type.entity';
import { ITranslation } from '../../translations/interfaces/translation.interface';
import { Language } from '../../languages/entities/language.entity';

@Entity()
export class PlaceTypeTitleTranslation
  extends TranslationBaseEntity
  implements ITranslation
{
  @ManyToOne(() => Language, (language) => language.id)
  language: Language;

  @ManyToOne(() => PlaceType, (placeType) => placeType.titles, {
    onDelete: 'CASCADE',
  })
  placeType: PlaceType;
}
