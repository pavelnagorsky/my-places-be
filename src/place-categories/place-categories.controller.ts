import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlaceCategoriesService } from './place-categories.service';
import { CreatePlaceCategoryDto } from './dto/create-place-category.dto';
import { UpdatePlaceCategoryDto } from './dto/update-place-category.dto';

@Controller('place-categories')
export class PlaceCategoriesController {
  constructor(private readonly placeCategoriesService: PlaceCategoriesService) {}

  @Post()
  create(@Body() createPlaceCategoryDto: CreatePlaceCategoryDto) {
    return this.placeCategoriesService.create(createPlaceCategoryDto);
  }

  @Get()
  findAll() {
    return this.placeCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.placeCategoriesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlaceCategoryDto: UpdatePlaceCategoryDto) {
    return this.placeCategoriesService.update(+id, updatePlaceCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.placeCategoriesService.remove(+id);
  }
}
