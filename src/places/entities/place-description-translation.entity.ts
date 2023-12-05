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
export class PlaceDescriptionTranslation implements ITranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  text: string;

  @Column({ default: false })
  original: boolean;

  @ManyToOne(() => Language, (language) => language.id)
  language: Language;

  @ManyToOne(() => Place, (place) => place.descriptions, {
    onDelete: 'CASCADE',
  })
  place: Place;
}
