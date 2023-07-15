import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class SearchRequestDto {
  @ApiProperty({ description: 'place types ids', isArray: true, type: Number })
  @IsNumber({}, { each: true })
  typesIds: number[];

  @ApiProperty({ description: 'place title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'search radius (km)', type: Number })
  @IsNumber()
  radius: number;

  @ApiProperty({ description: 'search coordinates', type: String })
  searchCoordinates: string | null;

  // pagination
  @ApiProperty({ description: 'page to return', type: Number, default: 1 })
  @IsNumber()
  @Min(1)
  pageToReturn: number;
  @ApiProperty({ description: 'items per page', type: Number, default: 9 })
  @IsNumber()
  @Min(1)
  itemsPerPage: number;
}
