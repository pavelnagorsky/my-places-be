import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
  JoinTable,
  ManyToMany,
} from 'typeorm';

import { Place } from '../../places/entities/place.entity';
import { Admin } from '../../entities/admin.entity';
import { Like } from '../../likes/entities/like.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Role } from '../../roles/entities/role.entity';
import { Image } from '../../images/entities/image.entity';
import { Review } from '../../reviews/entities/review.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 30 })
  firstName: string;

  @Column({ type: 'varchar', length: 30 })
  lastName: string;

  @Column({ type: 'varchar', length: 30 })
  email: string;

  @Column({ default: false })
  isEmailConfirmed: boolean;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => Place, (place) => place.author)
  places: Place[];

  @OneToMany(() => Place, (place) => place.moderator)
  placesModeration: Place[];

  @OneToMany(() => Review, (review) => review.author)
  reviews: Review[];

  @OneToMany(() => Review, (review) => review.moderator)
  reviewsModeration: Review[];

  @OneToOne(() => Admin, (admin) => admin.user, { cascade: true })
  @JoinColumn()
  admin: Admin;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable()
  roles: Role[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @OneToMany(() => Image, (image) => image.user)
  images: Image[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];
}
