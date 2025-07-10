import { ApiProperty } from "@nestjs/swagger";

export class PlacesCountByTypesDto {
  @ApiProperty({ title: "Churches count", type: Number })
  churchesCount: number;

  @ApiProperty({ title: "Museums count", type: Number })
  museumsCount: number;

  constructor(partial: Partial<PlacesCountByTypesDto>) {
    Object.assign(this, partial);
  }
}
