import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PlaceType } from '../../place-types/entities/place-type.entity';
import { Image } from '../../images/entities/image.entity';
import { Like } from '../../likes/entities/like.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { PlaceCategory } from '../../place-categories/entities/place-category.entity';
import { PlaceStatusesEnum } from '../enums/place-statuses.enum';
import { Review } from '../../reviews/entities/review.entity';
import { Report } from '../../reports/entities/report.entity';

@Entity()
export class Place {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ unique: true })
  slug: string;

  @Index()
  @Column({ type: 'int' })
  title: number;

  @Index()
  @Column({ type: 'int' })
  description: number;

  @OneToMany(() => Image, (image) => image.place, { cascade: true })
  images: Image[];

  @OneToMany(() => Review, (review) => review.place)
  reviews: Review[];

  @OneToMany(() => Comment, (comment) => comment.place, { cascade: true })
  comments: Comment[];

  @OneToMany(() => Report, (report) => report.place)
  reports: Report[];

  @Index()
  @Column({ type: 'int' })
  address: number;

  @Column({ type: 'varchar', nullable: true })
  website: string | null;

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

  @ManyToOne(() => User, (user) => user.placesModeration)
  moderator: User;

  @Column({ default: 0 })
  likesCount: number;

  @Column({ default: 0 })
  viewsCount: number;

  @OneToMany(() => Like, (like) => like.place, { cascade: true })
  likes: Like[];

  @Column({ default: PlaceStatusesEnum.MODERATION })
  status: PlaceStatusesEnum;

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
