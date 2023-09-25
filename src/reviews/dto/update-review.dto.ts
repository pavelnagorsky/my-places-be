import { ApiProperty } from '@nestjs/swagger';
import { CreateReviewDto } from './create-review.dto';

export class UpdateReviewDto extends CreateReviewDto {
  @ApiProperty({
    type: Boolean,
    default: false,
    description: 'Should translate again',
  })
  shouldTranslate: boolean;
}
