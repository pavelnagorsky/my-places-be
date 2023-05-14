import {
  Entity,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import { Place } from '../../places/entities/place.entity';
import { Image } from '../../images/entities/image.entity';

@Entity()
export class PlaceCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn({ type: 'int' })
  title: number;

  @OneToOne(() => Image, (image) => image.id)
  @JoinColumn()
  image: Image;

  @ManyToMany(() => Place, (place) => place.categories)
  places: Place[];
}
