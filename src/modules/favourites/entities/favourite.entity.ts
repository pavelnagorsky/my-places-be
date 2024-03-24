import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Place } from '../../places/entities/place.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Favourite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  actual: boolean;

  @ManyToOne(() => Place, (place) => place.favourites, { onDelete: 'CASCADE' })
  place: Place;

  @ManyToOne(() => User, (user) => user.favourites, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn({
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
