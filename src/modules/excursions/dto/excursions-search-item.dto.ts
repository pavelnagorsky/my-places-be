import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Transform } from "class-transformer";
import { ExcursionTranslation } from "../entities/excursion-translation.entity";
import { ExcursionPlace } from "../entities/excursion-place.entity";
import { ExcursionTypesEnum } from "../enums/excursion-types.enum";
import { TravelModesEnum } from "src/modules/routes/enums/travel-modes.enum";
import { Excursion } from "../entities/excursion.entity";
import { ExcursionComment } from "../modules/excursion-comments/entities/excursion-comment.entity";
import { ExcursionLike } from "../modules/excursion-likes/entities/excursion-like.entity";

export class ExcursionsSearchItemDto {
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

  @ApiProperty({ type: Number, description: "Excursion distance in km" })
  distance: number;

  @ApiProperty({
    type: Number,
    description: "Excursion places count",
  })
  placesCount: number;

  @ApiProperty({
    type: Number,
    isArray: true,
    description: "Excursion places images",
  })
  images: string[];

  @Exclude()
  excursionPlaces: ExcursionPlace[];

  @ApiProperty({
    type: Date,
    description: "created at",
  })
  createdAt: Date;

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

  @Exclude()
  comments: ExcursionComment[];

  @Exclude()
  likes: ExcursionLike[];

  constructor(partial: Partial<Excursion>) {
    Object.assign(this, partial);
    const excursionPlaces = partial.excursionPlaces ?? [];
    excursionPlaces.sort((a, b) => a.position - b.position);
    this.images = excursionPlaces
      .flatMap((ep) =>
        [...(ep.place.images || [])] // Clone array to avoid mutation
          .map((img) => ({
            url: img.url,
            position: img.position || 0,
            isPrimary: ep.isPrimary || false, // Capture the primary flag
          }))
      )
      .sort((a, b) => {
        // Sort by `isPrimary` first (descending), then by `position` (ascending)
        return (
          Number(b.isPrimary) - Number(a.isPrimary) || a.position - b.position
        );
      })
      .map((img) => img.url)
      .filter(Boolean);
  }
}
