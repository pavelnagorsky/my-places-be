import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { Favourite } from "../entities/favourite.entity";
import { Place } from "../../../entities/place.entity";

export class FavouriteDto {
  @ApiProperty({ title: "Favourite id", type: Number })
  id: number;

  @Exclude()
  place: Place;

  @ApiProperty({ title: "Place title", type: String })
  @Expose()
  get placeTitle(): string {
    return this.place.translations[0]?.title || "";
  }

  @ApiProperty({ title: "Place slug", type: String })
  @Expose()
  get placeSlug(): string {
    return this.place.slug;
  }

  @ApiProperty({ title: "Place id", type: Number })
  @Expose()
  get placeId(): number {
    return this.place.id;
  }

  @ApiProperty({
    title: "Is actual",
    type: Boolean,
    default: false,
  })
  actual: boolean;

  @ApiProperty({
    title: "Created at",
    type: Date,
  })
  createdAt: Date;

  constructor(partial: Partial<Favourite>) {
    Object.assign(this, partial);
  }
}
