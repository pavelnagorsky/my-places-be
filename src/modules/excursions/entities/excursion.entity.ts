import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { TravelModesEnum } from '../../routes/enums/travel-modes.enum';
import { ExcursionPlace } from './excursion-place.entity';
import { ExcursionTranslation } from './excursion-translation.entity';
import { ExcursionStatusesEnum } from '../enums/excursion-statuses.enum';

@Entity()
export class Excursion extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  slug: string;

  @OneToMany(
    () => ExcursionTranslation,
    (translation) => translation.excursion,
    {
      cascade: true,
    },
  )
  translations: ExcursionTranslation[];

  @OneToMany(() => ExcursionPlace, (excursionPlace) => excursionPlace.excursion)
  excursionPlaces: ExcursionPlace[];

  @ManyToOne(() => User, (user) => user.excursions)
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

  @Column({ default: 0 })
  viewsCount: number;

  @ManyToOne(() => User, (user) => user.excursionsModeration)
  moderator: User;

  @Column({ default: ExcursionStatusesEnum.MODERATION })
  status: ExcursionStatusesEnum;

  @Column({ type: 'varchar', length: 1500, nullable: true, default: null })
  moderationMessage: string | null;
}
