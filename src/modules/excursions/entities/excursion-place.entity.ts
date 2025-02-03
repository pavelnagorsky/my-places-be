import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Place } from '../../places/entities/place.entity';
import { Excursion } from './excursion.entity';
import { ExcursionPlaceTranslation } from './excursion-place-translation.entity';

@Entity()
export class ExcursionPlace {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(
    () => ExcursionPlaceTranslation,
    (translation) => translation.excursionPlace,
    {
      cascade: true,
    },
  )
  translations: ExcursionPlaceTranslation[];

  @Column({ type: 'tinyint', default: 0 })
  position: number;

  // KM
  @Column({ type: 'float', default: 0 })
  distance: number;

  // Minutes for travelling to place
  @Column({ type: 'float', default: 0 })
  duration: number;

  // Minutes of excursion on place
  @Column({ type: 'float', default: 0 })
  excursionDuration: number;

  @ManyToOne(() => Place, (place) => place.excursionPlaces, {
    onDelete: 'CASCADE',
  })
  place: Place;

  @ManyToOne(() => Excursion, (excursion) => excursion.excursionPlaces, {
    onDelete: 'CASCADE',
  })
  excursion: Excursion;
}
