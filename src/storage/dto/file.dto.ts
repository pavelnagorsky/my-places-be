import { ApiProperty } from '@nestjs/swagger';

export class FileDto {
  @ApiProperty({ type: String })
  publicUrl: string;
}
