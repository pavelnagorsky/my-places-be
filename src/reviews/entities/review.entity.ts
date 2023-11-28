import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Image } from '../../images/entities/image.entity';
import { User } from '../../users/entities/user.entity';
import { Place } from '../../places/entities/place.entity';
import { PlaceStatusesEnum } from '../../places/enums/place-statuses.enum';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'int' })
  title: number;

  @Index()
  @Column({ type: 'int' })
  description: number;

  @ManyToOne(() => Place, (place) => place.reviews)
  place: Place;

  @Column({ default: PlaceStatusesEnum.MODERATION })
  status: PlaceStatusesEnum;

  @OneToMany(() => Image, (image) => image.review, { cascade: true })
  images: Image[];

  @ManyToOne(() => User, (user) => user.reviews)
  author: User;

  @ManyToOne(() => User, (user) => user.reviewsModeration)
  moderator: User;

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
