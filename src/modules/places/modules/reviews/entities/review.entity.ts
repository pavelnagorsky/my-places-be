import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Image } from "../../../../images/entities/image.entity";
import { User } from "../../../../users/entities/user.entity";
import { Place } from "../../../entities/place.entity";
import { ReviewTranslation } from "./review-translation.entity";
import { ReviewStatusesEnum } from "../enums/review-statuses.enum";

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  viewsCount: number;

  @Column({ default: ReviewStatusesEnum.MODERATION })
  status: ReviewStatusesEnum;

  @Column({ type: "varchar", length: 1500, nullable: true, default: null })
  moderationMessage: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Place, (place) => place.reviews, {
    onDelete: "SET NULL",
  })
  place: Place;

  @OneToMany(() => Image, (image) => image.review, { cascade: true })
  images: Image[];

  @ManyToOne(() => User, (user) => user.reviews)
  author: User;

  @ManyToOne(() => User, (user) => user.reviewsModeration)
  moderator: User;

  @OneToMany(() => ReviewTranslation, (translation) => translation.review, {
    cascade: true,
  })
  translations: ReviewTranslation[];
}
