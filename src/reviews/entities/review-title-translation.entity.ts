import { TranslationBaseEntity } from '../../translations/entities/translation-base.entity';
import { ITranslation } from '../../translations/interfaces/translation.interface';
import { Entity, ManyToOne } from 'typeorm';
import { Language } from '../../languages/entities/language.entity';
import { Review } from './review.entity';

@Entity()
export class ReviewTitleTranslation
  extends TranslationBaseEntity
  implements ITranslation
{
  @ManyToOne(() => Language, (language) => language.id)
  language: Language;

  @ManyToOne(() => Review, (review) => review.titles, {
    onDelete: 'CASCADE',
  })
  review: Review;
}
