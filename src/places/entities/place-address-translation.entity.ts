import { TranslationBaseEntity } from '../../translations/entities/translation-base.entity';
import { ITranslation } from '../../translations/interfaces/translation.interface';
import { Entity, ManyToOne } from 'typeorm';
import { Language } from '../../languages/entities/language.entity';
import { Place } from './place.entity';

@Entity()
export class PlaceAddressTranslation
  extends TranslationBaseEntity
  implements ITranslation
{
  @ManyToOne(() => Language, (language) => language.id)
  language: Language;

  @ManyToOne(() => Place, (place) => place.addresses, {
    onDelete: 'CASCADE',
  })
  place: Place;
}
