import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { Place } from '../../places/entities/place.entity';
import { PlaceType } from '../../place-types/entities/place-type.entity';
import { PlaceCategory } from '../../place-categories/entities/place-category.entity';
import { User } from '../../users/entities/user.entity';
import { Review } from '../../reviews/entities/review.entity';

@Entity()
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column({ type: 'tinyint', default: 0 })
  position: number;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Place, (place) => place.images, { onDelete: 'CASCADE' })
  place: Place;

  @ManyToOne(() => Review, (review) => review.images, { onDelete: 'CASCADE' })
  review: Review;

  @ManyToOne(() => User, (user) => user.images)
  user: User;

  @OneToOne(() => PlaceType, (placeType) => placeType.image, {
    onDelete: 'CASCADE',
  })
  placeType: PlaceType;

  @OneToOne(() => PlaceType, (placeType) => placeType.image2, {
    onDelete: 'CASCADE',
  })
  placeType2: PlaceType;

  @OneToOne(() => PlaceCategory, (placeCategory) => placeCategory.image, {
    onDelete: 'CASCADE',
  })
  placeCategory: PlaceCategory;

  @OneToOne(() => PlaceCategory, (placeCategory) => placeCategory.image2, {
    onDelete: 'CASCADE',
  })
  placeCategory2: PlaceCategory;
}
