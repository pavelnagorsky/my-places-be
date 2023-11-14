import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Place } from '../../places/entities/place.entity';
import { Image } from '../../images/entities/image.entity';

@Entity()
export class PlaceType {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'int' })
  title: number;

  @Column({ default: false })
  commercial: boolean;

  @OneToOne(() => Image, (image) => image.id, { cascade: true })
  @JoinColumn()
  image: Image | null;

  @OneToOne(() => Image, (image) => image.id, { cascade: true })
  @JoinColumn()
  image2: Image | null;

  @OneToMany(() => Place, (place) => place.type)
  places: Place[];
}
