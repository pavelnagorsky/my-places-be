import { ITranslation } from '../../translations/interfaces/translation.interface';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Language } from '../../languages/entities/language.entity';
import { Review } from './review.entity';

@Entity()
export class ReviewDescriptionTranslation implements ITranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  original: boolean;

  @Column({ type: 'text', nullable: true })
  text: string;

  @ManyToOne(() => Language, (language) => language.id)
  language: Language;

  @ManyToOne(() => Review, (review) => review.descriptions, {
    onDelete: 'CASCADE',
  })
  review: Review;
}
