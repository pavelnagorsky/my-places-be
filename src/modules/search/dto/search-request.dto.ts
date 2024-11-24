import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { PaginationRequestDto } from '../../../shared/dto/pagination-request.dto';

export class SearchRequestDto extends PaginationRequestDto {
  @ApiProperty({ description: 'place types ids', isArray: true, type: Number })
  @IsNumber({}, { each: true })
  typesIds: number[];

  @ApiProperty({
    description: 'place categories ids',
    isArray: true,
    type: Number,
  })
  @IsNumber({}, { each: true })
  categoriesIds: number[];

  @ApiProperty({ description: 'place title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'search radius (km)', type: Number })
  @IsNumber()
  radius: number;

  @ApiProperty({ description: 'search start coordinates', type: String, nullable: true })
  searchStartCoordinates: string | null;

  @ApiProperty({ description: 'search end coordinates', type: String, nullable: true })
  searchEndCoordinates: string | null;
}
