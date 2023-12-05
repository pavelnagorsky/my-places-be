import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { PlaceTypeTitleTranslation } from '../../place-types/entities/place-type-title-translation.entity';
import { PlaceCategoryTitleTranslation } from '../../place-categories/entities/place-category-title-translation.entity';
import { PlaceTitleTranslation } from '../../places/entities/place-title-translation.entity';
import { PlaceDescriptionTranslation } from '../../places/entities/place-description-translation.entity';
import { PlaceAddressTranslation } from '../../places/entities/place-address-translation.entity';
import { ReviewTitleTranslation } from '../../reviews/entities/review-title-translation.entity';
import { ReviewDescriptionTranslation } from '../../reviews/entities/review-description-translation.entity';

@Entity()
export class Language {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 25 })
  title: string;

  @Column({ type: 'varchar', length: 10 })
  code: string;

  @OneToMany(
    () => PlaceTypeTitleTranslation,
    (translation) => translation.language,
  )
  placeTypeTitleTranslation: PlaceTypeTitleTranslation;

  @OneToMany(
    () => PlaceCategoryTitleTranslation,
    (translation) => translation.language,
  )
  placeCategoryTitleTranslation: PlaceCategoryTitleTranslation;

  @OneToMany(() => PlaceTitleTranslation, (translation) => translation.language)
  placeTitleTranslation: PlaceTitleTranslation;

  @OneToMany(
    () => PlaceDescriptionTranslation,
    (translation) => translation.language,
  )
  placeDescriptionTranslation: PlaceDescriptionTranslation;

  @OneToMany(
    () => PlaceAddressTranslation,
    (translation) => translation.language,
  )
  placeAddressTranslation: PlaceAddressTranslation;

  @OneToMany(
    () => ReviewTitleTranslation,
    (translation) => translation.language,
  )
  reviewTitleTranslation: ReviewTitleTranslation;

  @OneToMany(
    () => ReviewDescriptionTranslation,
    (translation) => translation.language,
  )
  reviewDescriptionTranslation: ReviewDescriptionTranslation;
}
