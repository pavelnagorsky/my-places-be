import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Image } from '../../images/entities/image.entity';
import { User } from '../../users/entities/user.entity';
import { Place } from '../../places/entities/place.entity';
import { PlaceStatusesEnum } from '../../places/enums/place-statuses.enum';
import { ReviewTranslation } from './review-translation.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => ReviewTranslation, (translation) => translation.review, {
    cascade: true,
  })
  translations: ReviewTranslation[];

  @ManyToOne(() => Place, (place) => place.reviews, {
    onDelete: 'SET NULL',
  })
  place: Place;

  @Column({ default: 0 })
  viewsCount: number;

  @Column({ default: PlaceStatusesEnum.MODERATION })
  status: PlaceStatusesEnum;

  @OneToMany(() => Image, (image) => image.review, { cascade: true })
  images: Image[];

  @ManyToOne(() => User, (user) => user.reviews)
  author: User;

  @ManyToOne(() => User, (user) => user.reviewsModeration)
  moderator: User;

  @Column({ type: 'varchar', nullable: true, default: null })
  moderationMessage: string | null;

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
