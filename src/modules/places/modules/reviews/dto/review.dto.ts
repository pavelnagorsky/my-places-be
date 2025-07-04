import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { Image } from "../../../../images/entities/image.entity";
import { Review } from "../entities/review.entity";
import { SearchReviewDto } from "./search-review.dto";

export class ReviewDto extends SearchReviewDto {
  @ApiProperty({
    type: String,
    description: "Review images",
    isArray: true,
  })
  @Transform(
    ({ value }: { value: Partial<Image>[] }) =>
      value?.filter((v) => Boolean(v.url)).map((v) => v.url) ?? []
  )
  images: string[];

  constructor(partial: Partial<Review>) {
    super(partial);
    Object.assign(this, partial);
  }
}
