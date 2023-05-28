import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Place } from '../../places/entities/place.entity';
import { Image } from '../../images/entities/image.entity';

@Entity()
export class PlaceType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true })
  title: number;

  @Column({ default: false })
  commercial: boolean;

  @OneToOne(() => Image, (image) => image.id)
  @JoinColumn()
  image: Image;

  @OneToMany(() => Place, (place) => place.type)
  places: Place[];
}
