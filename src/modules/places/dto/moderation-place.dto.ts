import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Transform } from "class-transformer";
import { PlaceTranslation } from "../entities/place-translation.entity";
import { PlaceType } from "../modules/place-types/entities/place-type.entity";
import { Place } from "../entities/place.entity";
import { User } from "../../users/entities/user.entity";

export class ModerationPlaceDto {
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

  @ApiProperty({ type: String, description: "Place type title" })
  @Transform(({ value }: { value: Partial<PlaceType> }) => {
    if (!!value.titles && value.titles.length > 0) {
      return value.titles[0].text;
    }
    return "";
  })
  type: string;

  @ApiProperty({
    type: Boolean,
    description: "is place an advertisement",
  })
  advertisement: boolean;

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
