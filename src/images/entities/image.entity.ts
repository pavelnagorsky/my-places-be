import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { Place } from '../../places/entities/place.entity';
import { PlaceType } from '../../place-types/entities/place-type.entity';

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

  @ManyToOne(() => Place, (place) => place.images)
  place: Place;

  @OneToOne(() => PlaceType, (placeType) => placeType.image)
  placeType: PlaceType;
}
