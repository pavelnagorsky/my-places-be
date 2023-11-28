import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { PlaceTypeTitleTranslation } from '../../place-types/entities/place-type-title-translation.entity';
import { PlaceCategoryTitleTranslation } from '../../place-categories/entities/place-category-title-translation.entity';

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
}
