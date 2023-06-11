import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ title: 'Text', type: String })
  text: string;
}
