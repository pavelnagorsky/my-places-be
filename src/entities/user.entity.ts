import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { Place } from './place.entity';
import { Admin } from './admin.entity';
import { Like } from './like.entity';
import { Comment } from './comment.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'char', length: 30 })
  firstName: string;

  @Column({ type: 'char', length: 30 })
  lastName: string;

  @Column({ type: 'char', length: 30 })
  email: string;

  @Column({ type: 'char' })
  password: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => Place, (place) => place.author)
  places: Place[];

  @OneToOne(() => Admin, (admin) => admin.user, { cascade: true })
  @JoinColumn()
  admin: Admin;

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];
}
