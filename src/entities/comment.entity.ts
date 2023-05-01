import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Place } from './place.entity';
import { Translation } from '../translations/entities/translation.entity';
import { User } from './user.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Translation, (translation) => translation.textId)
  @JoinColumn()
  text: Translation;

  @ManyToOne(() => User, (user) => user.comments)
  user: User;

  @ManyToOne(() => Place, (place) => place.comments)
  place: Place;
}
