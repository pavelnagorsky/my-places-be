import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { Place } from '../../places/entities/place.entity';
import { Image } from '../../images/entities/image.entity';
import { PlaceCategoryTitleTranslation } from './place-category-title-translation.entity';

@Entity()
export class PlaceCategory {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @OneToMany(
    () => PlaceCategoryTitleTranslation,
    (translation) => translation.placeCategory,
    { cascade: true },
  )
  titles: PlaceCategoryTitleTranslation[];

  @OneToOne(() => Image, (image) => image.id, { cascade: true })
  @JoinColumn()
  image: Image | null;

  @OneToOne(() => Image, (image) => image.id, { cascade: true })
  @JoinColumn()
  image2: Image | null;

  @ManyToMany(() => Place, (place) => place.categories)
  places: Place[];
}
