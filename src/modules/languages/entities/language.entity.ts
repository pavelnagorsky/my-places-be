import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { PlaceTypeTranslation } from '../../place-types/entities/place-type-translation.entity';
import { PlaceCategoryTranslation } from '../../place-categories/entities/place-category-translation.entity';
import { PlaceTranslation } from '../../places/entities/place-translation.entity';
import { ReviewTranslation } from '../../reviews/entities/review-translation.entity';
import { User } from '../../users/entities/user.entity';
import { Place } from '../../places/entities/place.entity';
import { LanguageIdEnum } from '../enums/language-id.enum';

@Entity()
export class Language {
  @PrimaryColumn({ type: 'int', enum: LanguageIdEnum })
  id: LanguageIdEnum;

  @Column({ type: 'varchar', length: 25 })
  title: string;

  @Column({ type: 'varchar', length: 10 })
  code: string;

  @OneToMany(() => PlaceTypeTranslation, (translation) => translation.language)
  placeTypeTitleTranslation: PlaceTypeTranslation;

  @OneToMany(
    () => PlaceCategoryTranslation,
    (translation) => translation.language,
  )
  placeCategoryTitleTranslation: PlaceCategoryTranslation;

  @OneToMany(() => PlaceTranslation, (translation) => translation.language)
  placeTranslation: PlaceTranslation;

  @OneToMany(() => ReviewTranslation, (translation) => translation.language)
  reviewTranslation: ReviewTranslation;

  @OneToMany(() => User, (user) => user.preferredLanguage)
  user: User;

  @OneToMany(() => Place, (place) => place.originalLanguage)
  place: Place;
}
