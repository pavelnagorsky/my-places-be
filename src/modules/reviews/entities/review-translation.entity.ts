import { ITranslation } from '../../translations/interfaces/translation.interface';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Language } from '../../languages/entities/language.entity';
import { Review } from './review.entity';
import { TranslationBaseEntity } from '../../translations/entities/translation-base.entity';

@Entity()
export class ReviewTranslation
  extends TranslationBaseEntity
  implements ITranslation
{
  @Column({ type: 'varchar', length: 300, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Language, (language) => language.reviewTranslations)
  language: Language;

  @ManyToOne(() => Review, (review) => review.translations, {
    onDelete: 'CASCADE',
  })
  review: Review;
}
