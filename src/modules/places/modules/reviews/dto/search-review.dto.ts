import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Transform } from "class-transformer";
import { Review } from "../entities/review.entity";
import { User } from "../../../../users/entities/user.entity";
import { ReviewTranslation } from "../entities/review-translation.entity";

export class SearchReviewDto {
  @ApiProperty({ title: "Review id", type: Number })
  id: number;

  @ApiProperty({ type: String, description: "Review title" })
  @Expose()
  get title(): string {
    return this.translations[0]?.title || "";
  }

  @Exclude()
  translations: ReviewTranslation[];

  @ApiProperty({ type: String, description: "Review description" })
  @Expose()
  get description(): string {
    return this.translations[0]?.description || "";
  }

  @ApiProperty({ title: "Author username", type: String })
  @Expose()
  get authorUsername(): string {
    return `${this.author?.firstName} ${this.author?.lastName}`;
  }

  @Exclude()
  author: Partial<User>;

  @ApiProperty({
    type: Date,
    description: "Created at",
  })
  createdAt: Date;

  constructor(partial: Partial<Review>) {
    Object.assign(this, partial);
  }
}
