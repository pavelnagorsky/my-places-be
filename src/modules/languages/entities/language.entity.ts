import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { PlaceTypeTranslation } from "../../places/modules/place-types/entities/place-type-translation.entity";
import { PlaceCategoryTranslation } from "../../places/modules/place-categories/entities/place-category-translation.entity";
import { PlaceTranslation } from "../../places/entities/place-translation.entity";
import { ReviewTranslation } from "../../places/modules/reviews/entities/review-translation.entity";
import { User } from "../../users/entities/user.entity";
import { Place } from "../../places/entities/place.entity";
import { LanguageIdEnum } from "../enums/language-id.enum";
import { RegionTranslation } from "../../excursions/modules/regions/entities/region-translation.entity";

@Entity()
export class Language {
  @PrimaryColumn()
  id: LanguageIdEnum;

  @Column({ type: "varchar", length: 25 })
  title: string;

  @Column({ type: "varchar", length: 10 })
  code: string;

  @OneToMany(() => PlaceTypeTranslation, (translation) => translation.language)
  placeTypeTranslations: PlaceTypeTranslation[];

  @OneToMany(
    () => PlaceCategoryTranslation,
    (translation) => translation.language
  )
  placeCategoryTranslations: PlaceCategoryTranslation[];

  @OneToMany(() => PlaceTranslation, (translation) => translation.language)
  placeTranslations: PlaceTranslation[];

  @OneToMany(() => ReviewTranslation, (translation) => translation.language)
  reviewTranslations: ReviewTranslation[];

  @OneToMany(() => User, (user) => user.preferredLanguage)
  users: User[];

  @OneToMany(() => Place, (place) => place.originalLanguage)
  places: Place[];

  @OneToMany(() => RegionTranslation, (translation) => translation.language)
  regionTranslations: RegionTranslation[];
}
