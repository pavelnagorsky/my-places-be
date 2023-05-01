import { Controller, Get } from '@nestjs/common';
import { PlacesService } from './places.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Places')
@Controller('/places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get()
  async getAll() {
    const places = await this.placesService.findAll();
    return {
      message: 'Places successfully fetched',
      places: places,
    };
  }
}
