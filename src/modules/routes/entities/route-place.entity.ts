import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Place } from '../../places/entities/place.entity';
import { Route } from './route.entity';

@Entity()
export class RoutePlace {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'tinyint', default: 0 })
  position: number;

  @ManyToOne(() => Place, (place) => place.routePlaces, { onDelete: 'CASCADE' })
  place: Place;

  @ManyToOne(() => Route, (route) => route.routePlaces, { onDelete: 'CASCADE' })
  route: Route;
}
