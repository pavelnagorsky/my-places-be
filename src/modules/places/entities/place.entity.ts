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
  JoinColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { PlaceType } from "../modules/place-types/entities/place-type.entity";
import { Image } from "../../images/entities/image.entity";
import { PlaceLike } from "../modules/place-likes/entities/place-like.entity";
import { PlaceComment } from "../modules/place-comments/entities/place-comment.entity";
import { PlaceCategory } from "../modules/place-categories/entities/place-category.entity";
import { PlaceStatusesEnum } from "../enums/place-statuses.enum";
import { Review } from "../modules/reviews/entities/review.entity";
import { Report } from "../../reports/entities/report.entity";
import { PlaceTranslation } from "./place-translation.entity";
import { Favourite } from "../modules/favourites/entities/favourite.entity";
import { Language } from "../../languages/entities/language.entity";
import { Route } from "../../routes/entities/route.entity";
import { RoutePlace } from "../../routes/entities/route-place.entity";
import { ExcursionPlace } from "../../excursions/entities/excursion-place.entity";

@Entity()
export class Place {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  slug: string;

  @OneToMany(() => PlaceTranslation, (translation) => translation.place, {
    cascade: true,
  })
  translations: PlaceTranslation[];

  @OneToMany(() => Image, (image) => image.place, { cascade: true })
  images: Image[];

  @OneToMany(() => PlaceComment, (comment) => comment.place, { cascade: true })
  comments: PlaceComment[];

  @OneToMany(() => Report, (report) => report.place, { cascade: true })
  reports: Report[];

  @Column({ type: "varchar", nullable: true })
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

  @Column({ type: "datetime", nullable: true })
  advEndDate: Date | null;

  @ManyToOne(() => Language, (language) => language.places)
  originalLanguage: Language;

  @ManyToOne(() => User, (user) => user.places)
  author: User;

  @ManyToOne(() => User, (user) => user.placesModeration)
  moderator: User;

  @Column({ type: "varchar", length: 1500, nullable: true, default: null })
  moderationMessage: string | null;

  @Column({ default: 0 })
  likesCount: number;

  @Column({ default: 0 })
  viewsCount: number;

  @OneToMany(() => PlaceLike, (like) => like.place, { cascade: true })
  likes: PlaceLike[];

  @Column({ default: PlaceStatusesEnum.MODERATION })
  status: PlaceStatusesEnum;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Favourite, (favourite) => favourite.place, { cascade: true })
  favourites: Favourite[];

  @OneToMany(() => Review, (review) => review.place, {
    cascade: true,
  })
  reviews: Review[];

  @OneToMany(() => RoutePlace, (routePlace) => routePlace.place)
  routePlaces: RoutePlace[];

  @OneToMany(() => ExcursionPlace, (excursionPlace) => excursionPlace.place)
  excursionPlaces: ExcursionPlace[];
}
