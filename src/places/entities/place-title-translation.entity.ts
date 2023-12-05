import { TranslationBaseEntity } from '../../translations/entities/translation-base.entity';
import { ITranslation } from '../../translations/interfaces/translation.interface';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Language } from '../../languages/entities/language.entity';
import { Place } from './place.entity';

@Entity()
export class PlaceTitleTranslation
  extends TranslationBaseEntity
  implements ITranslation
{
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'varchar', length: 300, nullable: true })
  text: string;

  @Column({ default: false })
  original: boolean;

  @ManyToOne(() => Language, (language) => language.id)
  language: Language;

  @ManyToOne(() => Place, (place) => place.titles, {
    onDelete: 'CASCADE',
  })
  place: Place;
}
