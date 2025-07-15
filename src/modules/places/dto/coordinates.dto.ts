import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class CoordinatesDto {
  @ApiProperty({
    type: Number,
    description: "Place lat coordinate",
  })
  @IsNumber()
  lat: number;

  @ApiProperty({
    type: Number,
    description: "Place lng coordinate",
  })
  @IsNumber()
  lng: number;

  constructor(coordinates: string) {
    const latLng = coordinates.split(";");
    this.lat = latLng[0] ? +latLng[0] : 1;
    this.lng = latLng[1] ? +latLng[1] : 1;
  }
}
