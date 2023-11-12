import {
  Entity,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
  Column,
  Index,
} from 'typeorm';
import { Place } from '../../places/entities/place.entity';
import { Image } from '../../images/entities/image.entity';

@Entity()
export class PlaceCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'int', unique: true })
  title: number;

  @OneToOne(() => Image, (image) => image.id, { cascade: true })
  @JoinColumn()
  image: Image | null;

  @OneToOne(() => Image, (image) => image.id, { cascade: true })
  @JoinColumn()
  image2: Image | null;

  @ManyToMany(() => Place, (place) => place.categories)
  places: Place[];
}
