import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Transform } from "class-transformer";
import { PlaceTranslation } from "../../places/entities/place-translation.entity";
import { CoordinatesDto } from "../../places/dto/coordinates.dto";
import { ExcursionPlace } from "../entities/excursion-place.entity";
import { Image } from "../../images/entities/image.entity";
import { ExcursionPlaceReviewDto } from "./excursion-place-review.dto";
import { Review } from "../../places/modules/reviews/entities/review.entity";

export class ExcursionPlaceDto {
  @ApiProperty({ title: "Place id", type: Number })
  id: number;

  @ApiProperty({
    title: "Excursion Place id",
    type: Number,
  })
  excursionPlaceId: number;

  @ApiProperty({ type: String, description: "Place url path" })
  slug: string;

  @ApiProperty({ type: String, description: "Place title" })
  @Expose()
  get title(): string {
    return this.translations[0]?.title || "";
  }

  @ApiProperty({ type: String, description: "Place address" })
  @Expose()
  get address(): string {
    return this.translations[0]?.address || "";
  }

  @ApiProperty({
    title: "Excursion leg view duration in minutes",
    type: Number,
  })
  excursionDuration: number;

  @ApiProperty({ type: String, description: "Excursion description by place" })
  excursionDescription: string;

  @Exclude()
  translations: PlaceTranslation[];

  @ApiProperty({
    type: Number,
    description: "Excursion leg movement duration in minutes",
  })
  duration: number;

  @ApiProperty({ type: Number, description: "Excursion leg distance in km" })
  distance: number;

  @ApiProperty({
    type: CoordinatesDto,
    description: "Place coordinates [lat;lng]",
  })
  @Transform(({ value }: { value: string }) => new CoordinatesDto(value))
  coordinates: CoordinatesDto;

  @ApiProperty({
    type: String,
    description: "Place images",
    isArray: true,
  })
  @Transform(({ value }: { value: Partial<Image>[] }) => {
    return (
      value
        ?.filter((image) => Boolean(image.url))
        ?.sort((a, b) => (a.position || 0) - (b.position || 0)) // Sort by position ASC
        .map((v) => v.url) ?? []
    );
  })
  images: string[];

  @ApiProperty({ type: Boolean, description: "Is primary place" })
  isPrimary: boolean;

  @ApiProperty({
    type: ExcursionPlaceReviewDto,
    description: "Place reviews",
    isArray: true,
  })
  @Transform(({ value }: { value: Partial<Review>[] }) =>
    value.map((review) => new ExcursionPlaceReviewDto(review))
  )
  reviews: ExcursionPlaceReviewDto[];

  constructor(partial: Partial<ExcursionPlace>) {
    Object.assign(this, partial.place);
    this.isPrimary = partial.isPrimary ?? false;
    this.excursionPlaceId = partial.id as number;
    this.distance = partial.distance || 0;
    this.duration = partial.duration || 0;
    this.excursionDuration = partial.excursionDuration || 0;
    if (partial?.translations) {
      this.excursionDescription = partial.translations[0]?.description || "";
    } else {
      this.excursionDescription = "";
    }
  }
}
