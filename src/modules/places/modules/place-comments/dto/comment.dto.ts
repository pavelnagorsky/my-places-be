import { ApiProperty } from "@nestjs/swagger";
import { PlaceComment } from "../entities/place-comment.entity";
import { Exclude, Expose } from "class-transformer";
import { User } from "../../../../users/entities/user.entity";

export class CommentDto {
  constructor(partial: Partial<PlaceComment>) {
    Object.assign(this, partial);
  }

  @ApiProperty({ title: "Id", type: Number })
  id: number;

  @ApiProperty({ title: "Author username", type: String })
  @Expose()
  get authorUsername(): string {
    return `${this.user?.firstName} ${this.user?.lastName}`;
  }

  @ApiProperty({ title: "Author id", type: Number })
  @Expose()
  get authorId(): number | null {
    return this.user?.id || null;
  }

  @Exclude()
  user: Partial<User>;

  @ApiProperty({ title: "Text", type: String })
  text: string;

  @ApiProperty({ title: "Created at", type: Date })
  createdAt: Date;
}
