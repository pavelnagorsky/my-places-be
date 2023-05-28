import {
  Entity,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
  Column,
} from 'typeorm';
import { Place } from '../../places/entities/place.entity';
import { Image } from '../../images/entities/image.entity';

@Entity()
export class PlaceCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true })
  title: number;

  @OneToOne(() => Image, (image) => image.id)
  @JoinColumn()
  image: Image;

  @ManyToMany(() => Place, (place) => place.categories)
  places: Place[];
}
