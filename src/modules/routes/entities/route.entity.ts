import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { RoutePlace } from './route-place.entity';
import { TravelModesEnum } from '../enums/travel-modes.enum';

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

  @OneToMany(() => RoutePlace, (routePlace) => routePlace.route)
  routePlaces: RoutePlace[];

  @ManyToOne(() => User, (user) => user.routes)
  author: User;

  // KM
  @Column({ type: 'float', default: 0 })
  distance: number;

  // Minutes
  @Column({ type: 'float', default: 0 })
  duration: number;

  // Duration in minutes - from last place to end of the route
  @Column({ type: 'float', default: 0 })
  lastRouteLegDuration: number;

  // Distance in km - from last place to end of the route
  @Column({ type: 'float', default: 0 })
  lastRouteLegDistance: number;

  @Column({ default: TravelModesEnum.DRIVING })
  travelMode: TravelModesEnum;
}
