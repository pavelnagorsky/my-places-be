import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Transform } from "class-transformer";
import { ExcursionTranslation } from "../entities/excursion-translation.entity";
import { ExcursionPlaceDto } from "./excursion-place.dto";
import { ExcursionPlace } from "../entities/excursion-place.entity";
import { ExcursionTypesEnum } from "../enums/excursion-types.enum";
import { TravelModesEnum } from "src/modules/routes/enums/travel-modes.enum";
import { Excursion } from "../entities/excursion.entity";
import { User } from "../../users/entities/user.entity";
import { ExcursionStatusesEnum } from "../enums/excursion-statuses.enum";
import { RegionDto } from "../../regions/dto/region.dto";
import { PlaceLike } from "../../places/modules/place-likes/entities/place-like.entity";
import { ExcursionLike } from "../modules/excursion-likes/entities/excursion-like.entity";
import { ExcursionComment } from "../modules/excursion-comments/entities/excursion-comment.entity";

export class ExcursionDto {
  @ApiProperty({ title: "Excursion id", type: Number })
  id: number;

  @ApiProperty({ type: String, description: "Excursion url path" })
  slug: string;

  @ApiProperty({ type: String, description: "Excursion title" })
  @Expose()
  get title(): string {
    return this.translations[0]?.title || "";
  }

  @ApiProperty({ type: String, description: "Excursion description" })
  @Expose()
  get description(): string {
    return this.translations[0]?.description || "";
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
    type: ExcursionPlaceDto,
    isArray: true,
    description: "Excursion places",
  })
  places: ExcursionPlaceDto[];

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

  @ApiProperty({
    type: RegionDto,
    description: "excursion region",
    nullable: true,
  })
  @Transform(({ value }) => (value ? new RegionDto(value) : null))
  region: RegionDto | null;

  @ApiProperty({ title: "Views count", type: Number })
  viewsCount: number;

  @ApiProperty({ type: Number, description: "Likes count" })
  likesCount: number;

  @ApiProperty({
    type: String,
    description: "Excursion images",
    isArray: true,
  })
  @Expose()
  get images(): string[] {
    return this.excursionPlaces
      .flatMap((ep) =>
        [...(ep.place.images ?? [])] // Ensure it's always an array
          .map((img) => ({
            url: img.url,
            position: img.position ?? 0,
            isPrimary: Boolean(ep.isPrimary), // Capture primary flag
          }))
      )
      .sort(
        (a, b) =>
          Number(b.isPrimary) - Number(a.isPrimary) || a.position - b.position
      )
      .map((img) => img.url)
      .filter(Boolean);
  }

  @ApiProperty({
    type: String,
    description: "Excursion moderation feedback",
    nullable: true,
  })
  moderationMessage: string | null;

  @ApiProperty({ enum: ExcursionStatusesEnum, description: "Excursion status" })
  status: ExcursionStatusesEnum;

  @Exclude()
  author: User;

  @Exclude()
  comments: ExcursionComment[];

  @Exclude()
  likes: ExcursionLike[];

  @ApiProperty({ type: String, description: "Author username" })
  @Expose()
  get authorName(): string {
    return `${this.author.firstName} ${this.author.lastName}`;
  }

  constructor(partial: Partial<Excursion>) {
    Object.assign(this, partial);
    this.places = (partial.excursionPlaces ?? []).map(
      (excursionPlace) => new ExcursionPlaceDto(excursionPlace)
    );
  }
}
