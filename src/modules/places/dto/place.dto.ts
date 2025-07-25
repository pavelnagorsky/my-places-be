import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Transform } from "class-transformer";
import { TranslationBaseEntity } from "../../AI/translations/entities/translation-base.entity";
import { PlaceTypeDto } from "../modules/place-types/dto/place-type.dto";
import { PlaceType } from "../modules/place-types/entities/place-type.entity";
import { PlaceCategoryDto } from "../modules/place-categories/dto/place-category.dto";
import { PlaceCategory } from "../modules/place-categories/entities/place-category.entity";
import { Image } from "../../images/entities/image.entity";
import { Place } from "../entities/place.entity";
import { PlaceLike } from "../modules/place-likes/entities/place-like.entity";
import { PlaceStatusesEnum } from "../enums/place-statuses.enum";
import { CoordinatesDto } from "./coordinates.dto";
import { PlaceTranslation } from "../entities/place-translation.entity";

export class PlaceDto {
  @ApiProperty({ title: "Place id", type: Number })
  id: number;

  @ApiProperty({ type: String, description: "Place url path" })
  slug: string;

  @ApiProperty({ type: String, description: "Place title" })
  @Expose()
  get title(): string {
    return this.translations[0]?.title || "";
  }

  @Exclude()
  translations: PlaceTranslation[];

  @ApiProperty({ type: String, description: "Place description" })
  @Expose()
  get description(): string {
    return this.translations[0]?.description || "";
  }

  @ApiProperty({ type: String, description: "Place address" })
  @Expose()
  get address(): string {
    return this.translations[0]?.address || "";
  }

  @ApiProperty({ type: PlaceTypeDto, description: "Place type" })
  @Transform(
    ({ value }: { value: Partial<PlaceType> }) => new PlaceTypeDto(value)
  )
  type: PlaceTypeDto;

  @ApiProperty({ type: Number, description: "Likes count" })
  likesCount: number;

  @ApiProperty({ type: Number, description: "Views count" })
  viewsCount: number;

  @ApiProperty({
    type: PlaceCategoryDto,
    description: "Place categories",
    isArray: true,
  })
  @Transform(({ value }: { value: Partial<PlaceCategory>[] }) =>
    value.map((category) => new PlaceCategoryDto(category))
  )
  categories: PlaceCategoryDto[];

  @Exclude()
  comments: Comment[];

  @Exclude()
  likes: PlaceLike[];

  @ApiProperty({
    type: String,
    description: "Place images",
    isArray: true,
  })
  @Transform(
    ({ value }: { value: Partial<Image>[] }) =>
      value?.filter((v) => Boolean(v.url)).map((v) => v.url) ?? []
  )
  images: string[];

  @ApiProperty({
    type: CoordinatesDto,
    description: "Place coordinates [lat;lng]",
  })
  @Transform(({ value }: { value: string }) => new CoordinatesDto(value))
  coordinates: CoordinatesDto;

  @ApiProperty({
    type: String,
    description: "Place website url",
    nullable: true,
  })
  website: string | null;

  @ApiProperty({
    type: Boolean,
    description: "is place an advertisement",
  })
  advertisement: boolean;

  @ApiProperty({
    type: Date,
    description: "advertisement end date",
    nullable: true,
  })
  advEndDate: Date | null;

  @Exclude()
  status: PlaceStatusesEnum;

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

  constructor(partial: Partial<Place>) {
    Object.assign(this, partial);
  }
}
