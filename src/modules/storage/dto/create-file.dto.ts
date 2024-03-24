import { ApiProperty } from '@nestjs/swagger';

export class CreateFileDto {
  @ApiProperty({ type: String, format: 'binary', required: true })
  file: Express.Multer.File;
}
