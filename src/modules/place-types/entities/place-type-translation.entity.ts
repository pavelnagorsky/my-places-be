import { TranslationBaseEntity } from '../../translations/entities/translation-base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { PlaceType } from './place-type.entity';
import { ITranslation } from '../../translations/interfaces/translation.interface';
import { Language } from '../../languages/entities/language.entity';

@Entity()
export class PlaceTypeTranslation
  extends TranslationBaseEntity
  implements ITranslation
{
  @ManyToOne(() => Language, (language) => language.placeTypeTranslations)
  language: Language;

  @Column({ type: 'varchar', length: 300, nullable: true })
  text: string;

  @ManyToOne(() => PlaceType, (placeType) => placeType.titles, {
    onDelete: 'CASCADE',
  })
  placeType: PlaceType;
}
