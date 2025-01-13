import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Place } from '../../places/entities/place.entity';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Route extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500, default: '' })
  title: string;

  @Column()
  coordinatesStart: string;

  @Column()
  coordinatesEnd: string;

  @ManyToMany(() => Place, (place) => place.routes)
  @JoinTable()
  places: Place[];

  @ManyToOne(() => User, (user) => user.routes)
  author: User;

  // KM
  @Column({ type: 'decimal', default: 0 })
  distance: number;

  // Hours
  @Column({ type: 'decimal', default: 0 })
  time: number;
}
