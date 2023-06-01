import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Place } from '../places/entities/place.entity';
import { User } from '../users/entities/user.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 1000 })
  text: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.comments)
  user: User;

  @ManyToOne(() => Place, (place) => place.comments)
  place: Place;
}
