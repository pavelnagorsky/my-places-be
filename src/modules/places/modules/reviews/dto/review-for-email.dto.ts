import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { User } from "../../../../users/entities/user.entity";
import { ReviewTranslation } from "../entities/review-translation.entity";
import { ReviewStatusesEnum } from "../enums/review-statuses.enum";
import { Review } from "../entities/review.entity";

export class ReviewForEmailDto {
  @ApiProperty({ type: String, description: "Review title" })
  @Expose()
  get title(): string {
    return this.translations[0]?.title || "";
  }

  @Exclude()
  translations: ReviewTranslation[];

  @ApiProperty({ title: "First Name", type: String, default: "John" })
  @Expose()
  get firstName(): string {
    return this.author.firstName || "";
  }

  @ApiProperty({ title: "Last Name", type: String, default: "Doe" })
  @Expose()
  get lastName(): string {
    return this.author.lastName || "";
  }

  @ApiProperty({ title: "Receive emails", type: Boolean })
  receiveEmails: boolean;

  @ApiProperty({ title: "Email", type: String, default: "johndoe@gmail.com" })
  @Expose()
  get email(): string {
    return this.author.email || "";
  }

  @Exclude()
  author: User;

  @ApiProperty({
    type: Date,
    description: "created at",
  })
  createdAt: Date;

  @ApiProperty({ enum: ReviewStatusesEnum, description: "Review status" })
  status: ReviewStatusesEnum;

  constructor(partial: Partial<Review>) {
    Object.assign(this, partial);
  }
}
