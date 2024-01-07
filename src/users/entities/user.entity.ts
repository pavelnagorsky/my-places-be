import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
  JoinTable,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

import { Place } from '../../places/entities/place.entity';
import { Admin } from '../../entities/admin.entity';
import { Like } from '../../likes/entities/like.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Role } from '../../roles/entities/role.entity';
import { Image } from '../../images/entities/image.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Report } from '../../reports/entities/report.entity';
import { Language } from '../../languages/entities/language.entity';
import { Favourite } from '../../favourites/entities/favourite.entity';

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

  @OneToMany(() => Report, (report) => report.moderator)
  reportsModeration: Report;

  @ManyToOne(() => Language, (language) => language.id, { nullable: true })
  preferredLanguage: Language | null;

  @CreateDateColumn({
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToMany(() => Favourite, (favourite) => favourite.user, { cascade: true })
  favourites: Favourite[];
}
