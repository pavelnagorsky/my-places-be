import { ApiProperty } from '@nestjs/swagger';
import { Comment } from '../entities/comment.entity';
import { Exclude, Expose } from 'class-transformer';
import { User } from '../../users/entities/user.entity';

export class CommentDto {
  constructor(partial: Partial<Comment>) {
    Object.assign(this, partial);
  }

  @ApiProperty({ title: 'Id', type: Number })
  id: number;

  @ApiProperty({ title: 'Author username', type: String })
  @Expose()
  get authorUsername(): string {
    return `${this.user?.firstName} ${this.user?.lastName}`;
  }

  @ApiProperty({ title: 'Author id', type: Number })
  @Expose()
  get authorId(): number | null {
    return this.user?.id || null;
  }

  @ApiProperty({ title: 'Can manage', type: Boolean })
  canManage: boolean;

  @Exclude()
  user: Partial<User>;

  @ApiProperty({ title: 'Text', type: String })
  text: string;

  @ApiProperty({ title: 'Created at', type: Date })
  createdAt: Date;
}
