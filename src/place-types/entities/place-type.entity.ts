import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Place } from '../../entities/place.entity';
import { Image } from '../../entities/image.entity';

@Entity()
export class PlaceType {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn({ type: 'int' })
  title: number;

  @Column({ default: false })
  commercial: boolean;

  @OneToOne(() => Image, (image) => image.id)
  @JoinColumn()
  image: Image;

  @OneToMany(() => Place, (place) => place.type)
  places: Place[];
}
