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
} from "typeorm";

import { Place } from "../../places/entities/place.entity";
import { Moderator } from "./moderator.entity";
import { PlaceLike } from "../../places/modules/place-likes/entities/place-like.entity";
import { PlaceComment } from "../../places/modules/place-comments/entities/place-comment.entity";
import { Role } from "../../roles/entities/role.entity";
import { Image } from "../../images/entities/image.entity";
import { Review } from "../../places/modules/reviews/entities/review.entity";
import { Report } from "../../reports/entities/report.entity";
import { Language } from "../../languages/entities/language.entity";
import { Favourite } from "../../places/modules/favourites/entities/favourite.entity";
import { RefreshTokenEntity } from "../../auth/entities/refresh-token.entity";
import { Route } from "../../routes/entities/route.entity";
import { Excursion } from "../../excursions/entities/excursion.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 30 })
  firstName: string;

  @Column({ type: "varchar", length: 30 })
  lastName: string;

  @Column({ type: "varchar", length: 60 })
  email: string;

  @Column({ default: false })
  isEmailConfirmed: boolean;

  @Column({ default: true })
  receiveEmails: boolean;

  @Column({ type: "varchar", length: 100, nullable: true, default: null })
  googleUserId: string;

  @Column({ type: "varchar", length: 100, nullable: true, default: null })
  yandexUserId: string;

  @Column({ type: "varchar", length: 100, nullable: true, default: null })
  vkUserId: string;

  @Column({ type: "varchar" })
  password: string;

  @Column({ default: null, type: "datetime", nullable: true })
  blockedUntil: null | Date;

  @Column({ default: null, type: "varchar", length: 300, nullable: true })
  blockReason: null | string;

  @OneToMany(() => Place, (place) => place.author)
  places: Place[];

  @OneToMany(() => Place, (place) => place.moderator)
  placesModeration: Place[];

  @OneToMany(() => Review, (review) => review.author)
  reviews: Review[];

  @OneToMany(() => Review, (review) => review.moderator)
  reviewsModeration: Review[];

  @OneToOne(() => Moderator, (moderator) => moderator.user, {
    nullable: true,
    cascade: true,
    onDelete: "SET NULL",
  })
  @JoinColumn()
  moderator: Moderator | null;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable()
  roles: Role[];

  @OneToMany(() => PlaceLike, (like) => like.user)
  likes: PlaceLike[];

  @OneToMany(() => Image, (image) => image.user)
  images: Image[];

  @OneToMany(() => PlaceComment, (comment) => comment.user)
  comments: PlaceComment[];

  @OneToMany(() => RefreshTokenEntity, (rToken) => rToken.user)
  refreshTokens: RefreshTokenEntity[];

  @OneToMany(() => Report, (report) => report.moderator)
  reportsModeration: Report;

  @ManyToOne(() => Language, (language) => language.users, { nullable: true })
  preferredLanguage: Language | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Favourite, (favourite) => favourite.user, { cascade: true })
  favourites: Favourite[];

  @OneToMany(() => Route, (route) => route.author)
  routes: Route[];

  @OneToMany(() => Excursion, (excursion) => excursion.author)
  excursions: Excursion[];

  @OneToMany(() => Excursion, (excursion) => excursion.moderator)
  excursionsModeration: Excursion[];
}
