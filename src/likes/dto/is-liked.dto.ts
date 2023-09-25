import { ApiProperty } from '@nestjs/swagger';

export class IsLikedDto {
  @ApiProperty({ type: Boolean, description: 'Is liked' })
  isLiked: boolean;

  constructor(isLiked: boolean) {
    this.isLiked = isLiked;
  }
}
