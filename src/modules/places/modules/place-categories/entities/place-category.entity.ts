import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
  OneToMany,
} from "typeorm";
import { Place } from "../../../entities/place.entity";
import { Image } from "../../../../images/entities/image.entity";
import { PlaceCategoryTranslation } from "./place-category-translation.entity";

@Entity()
export class PlaceCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(
    () => PlaceCategoryTranslation,
    (translation) => translation.placeCategory,
    { cascade: true }
  )
  titles: PlaceCategoryTranslation[];

  @OneToOne(() => Image, (image) => image.placeCategory, { cascade: true })
  @JoinColumn()
  image: Image | null;

  @OneToOne(() => Image, (image) => image.placeCategory2, { cascade: true })
  @JoinColumn()
  image2: Image | null;

  @ManyToMany(() => Place, (place) => place.categories)
  places: Place[];
}
