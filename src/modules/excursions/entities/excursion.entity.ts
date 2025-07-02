import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { BaseEntity } from "../../../shared/entities/base.entity";
import { User } from "../../users/entities/user.entity";
import { TravelModesEnum } from "../../routes/enums/travel-modes.enum";
import { ExcursionPlace } from "./excursion-place.entity";
import { ExcursionTranslation } from "./excursion-translation.entity";
import { ExcursionStatusesEnum } from "../enums/excursion-statuses.enum";
import { ExcursionTypesEnum } from "../enums/excursion-types.enum";
import { Region } from "../../regions/entities/region.entity";
import { ExcursionLike } from "../modules/excursion-likes/entities/excursion-like.entity";
import { PlaceComment } from "../../places/modules/place-comments/entities/place-comment.entity";
import { ExcursionComment } from "../modules/excursion-comments/entities/excursion-comment.entity";
import { Report } from "../../reports/entities/report.entity";

@Entity()
export class Excursion extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  slug: string;

  @OneToMany(
    () => ExcursionTranslation,
    (translation) => translation.excursion,
    {
      cascade: true,
    }
  )
  translations: ExcursionTranslation[];

  @OneToMany(
    () => ExcursionPlace,
    (excursionPlace) => excursionPlace.excursion,
    {
      cascade: true,
    }
  )
  excursionPlaces: ExcursionPlace[];

  @ManyToOne(() => User, (user) => user.excursions)
  author: User;

  @Column()
  type: ExcursionTypesEnum;

  // KM
  @Column({ type: "float", default: 0 })
  distance: number;

  // Minutes
  @Column({ type: "float", default: 0 })
  duration: number;

  @Column({ default: TravelModesEnum.DRIVING })
  travelMode: TravelModesEnum;

  @Column({ default: 0 })
  viewsCount: number;

  @Column({ default: 0 })
  likesCount: number;

  @OneToMany(() => ExcursionLike, (like) => like.excursion, { cascade: true })
  likes: ExcursionLike[];

  @OneToMany(() => ExcursionComment, (comment) => comment.excursion, {
    cascade: true,
  })
  comments: ExcursionComment[];

  @ManyToOne(() => User, (user) => user.excursionsModeration)
  moderator: User;

  @Column({ default: ExcursionStatusesEnum.MODERATION })
  status: ExcursionStatusesEnum;

  @ManyToOne(() => Region, (region) => region.excursions, { nullable: true })
  region: Region | null;

  @OneToMany(() => Report, (report) => report.excursion, { cascade: true })
  reports: Report[];

  @Column({ type: "varchar", length: 1500, nullable: true, default: null })
  moderationMessage: string | null;
}
