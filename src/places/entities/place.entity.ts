import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PlaceType } from '../../place-types/entities/place-type.entity';
import { Admin } from '../../entities/admin.entity';
import { Image } from '../../images/entities/image.entity';
import { Like } from './like.entity';
import { Comment } from '../../entities/comment.entity';
import { PlaceCategory } from '../../place-categories/entities/place-category.entity';

@Entity()
export class Place {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true })
  title: number;

  @Column({ type: 'int', unique: true })
  description: number;

  @OneToMany(() => Image, (image) => image.place)
  images: Image[];

  @OneToMany(() => Comment, (comment) => comment.place)
  comments: Comment[];

  @Column({ type: 'int', unique: true })
  address: number;

  @Column({ nullable: true })
  website: string;

  @ManyToOne(() => PlaceType, (type) => type.places)
  type: PlaceType;

  @ManyToMany(() => PlaceCategory, (placeCategory) => placeCategory.places)
  @JoinTable()
  categories: PlaceCategory[];

  @Column()
  coordinates: string;

  @Column({ default: false })
  advertisement: boolean;

  @Column({ nullable: true })
  advEndDate: Date;

  @ManyToOne(() => User, (user) => user.places)
  author: User;

  @ManyToOne(() => Admin, (admin) => admin.places)
  admin: Admin;

  @Column({ default: 0 })
  likesCount: number;

  @Column({ default: 0 })
  viewsCount: number;

  @OneToMany(() => Like, (like) => like.place)
  likes: Like[];

  @Column({ default: true })
  moderation: boolean;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
