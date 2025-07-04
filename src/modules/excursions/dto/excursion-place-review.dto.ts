import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { ReviewTranslation } from "../../places/modules/reviews/entities/review-translation.entity";
import { Review } from "../../places/modules/reviews/entities/review.entity";

export class ExcursionPlaceReviewDto {
  @ApiProperty({ title: "Review id", type: Number })
  id: number;

  @ApiProperty({ type: String, description: "Review title" })
  @Expose()
  get title(): string {
    return this.translations[0]?.title || "";
  }

  @Exclude()
  translations: ReviewTranslation[];

  constructor(partial: Partial<Review>) {
    Object.assign(this, partial);
  }
}
