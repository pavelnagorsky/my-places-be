import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Place } from "../../../entities/place.entity";
import { Image } from "../../../../images/entities/image.entity";
import { PlaceTypeTranslation } from "./place-type-translation.entity";

@Entity()
export class PlaceType {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(
    () => PlaceTypeTranslation,
    (translation) => translation.placeType,
    { cascade: true }
  )
  titles: PlaceTypeTranslation[];

  @Column({ default: false })
  commercial: boolean;

  @OneToOne(() => Image, (image) => image.placeType, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn()
  image: Image | null;

  @OneToOne(() => Image, (image) => image.placeType2, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn()
  image2: Image | null;

  @OneToMany(() => Place, (place) => place.type)
  places: Place[];
}
