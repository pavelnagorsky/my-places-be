import { ApiProperty } from '@nestjs/swagger';

export class CoordinatesDto {
  @ApiProperty({
    type: Number,
    description: 'Place lat coordinate',
  })
  lat: number;

  @ApiProperty({
    type: Number,
    description: 'Place lng coordinate',
  })
  lng: number;

  constructor(coordinates: string) {
    const latLng = coordinates.split(';');
    this.lat = latLng[0] ? +latLng[0] : 1;
    this.lng = latLng[1] ? +latLng[1] : 1;
  }
}
