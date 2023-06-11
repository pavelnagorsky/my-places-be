import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Place } from './place.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.likes)
  user: User;

  @ManyToOne(() => Place, (place) => place.likes, { onDelete: 'CASCADE' })
  place: Place;
}
