import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Transform } from "class-transformer";
import { ExcursionTranslation } from "../entities/excursion-translation.entity";
import { ExcursionPlace } from "../entities/excursion-place.entity";
import { ExcursionTypesEnum } from "../enums/excursion-types.enum";
import { TravelModesEnum } from "src/modules/routes/enums/travel-modes.enum";
import { Excursion } from "../entities/excursion.entity";
import { ExcursionsListItemPlaceDto } from "./excursions-list-item-place.dto";
import { User } from "../../users/entities/user.entity";
import { ExcursionStatusesEnum } from "../enums/excursion-statuses.enum";
import { ExcursionComment } from "../modules/excursion-comments/entities/excursion-comment.entity";
import { ExcursionLike } from "../modules/excursion-likes/entities/excursion-like.entity";

export class ExcursionsListItemDto {
  @ApiProperty({ title: "Excursion id", type: Number })
  id: number;

  @ApiProperty({ type: String, description: "Excursion url path" })
  slug: string;

  @ApiProperty({ type: String, description: "Excursion title" })
  @Expose()
  get title(): string {
    return this.translations[0]?.title || "";
  }

  @Exclude()
  translations: ExcursionTranslation[];

  @ApiProperty({
    type: Number,
    description: "Excursion movement duration in minutes",
  })
  duration: number;

  @ApiProperty({ title: "Excursion view duration in minutes", type: Number })
  @Expose()
  get excursionDuration(): number {
    return this.places.reduce((acc, currentValue) => {
      return acc + currentValue.excursionDuration || 0;
    }, 0);
  }

  @ApiProperty({ type: Number, description: "Excursion distance in km" })
  distance: number;

  @ApiProperty({
    type: ExcursionsListItemPlaceDto,
    isArray: true,
    description: "Excursion places",
  })
  places: ExcursionsListItemPlaceDto[];

  @Exclude()
  excursionPlaces: ExcursionPlace[];

  @ApiProperty({
    type: Date,
    description: "created at",
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: "updated at",
  })
  updatedAt: Date;

  @ApiProperty({
    enum: ExcursionTypesEnum,
    description: "Excursion type",
  })
  type: ExcursionTypesEnum;

  @ApiProperty({
    enum: TravelModesEnum,
    description: "Travel mode",
  })
  travelMode: TravelModesEnum;

  @ApiProperty({ title: "Views count", type: Number })
  viewsCount: number;

  @ApiProperty({ type: Number, description: "Likes count" })
  likesCount: number;

  @ApiProperty({ enum: ExcursionStatusesEnum, description: "Excursion status" })
  status: ExcursionStatusesEnum;

  @ApiProperty({
    type: String,
    description: "Excursion moderation feedback",
    nullable: true,
  })
  moderationMessage: string | null;

  @Exclude()
  author: User;

  @ApiProperty({ type: String, description: "Author username" })
  @Expose()
  get authorName(): string {
    return `${this.author.firstName} ${this.author.lastName}`;
  }

  @ApiProperty({ type: String, description: "Author email" })
  @Expose()
  get authorEmail(): string {
    return this.author.email;
  }

  @ApiProperty({ type: Number, description: "Comments count" })
  @Expose()
  get commentsCount(): number {
    return this.comments.length;
  }

  @Exclude()
  comments: ExcursionComment[];

  @Exclude()
  likes: ExcursionLike[];

  constructor(partial: Partial<Excursion>) {
    Object.assign(this, partial);
    const excursionPlaces = partial.excursionPlaces ?? [];
    excursionPlaces.sort((a, b) => a.position - b.position);
    this.places = excursionPlaces.map(
      (excursionPlace) => new ExcursionsListItemPlaceDto(excursionPlace)
    );
  }
}
