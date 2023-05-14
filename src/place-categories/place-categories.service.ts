import { Injectable } from '@nestjs/common';
import { CreatePlaceCategoryDto } from './dto/create-place-category.dto';
import { UpdatePlaceCategoryDto } from './dto/update-place-category.dto';

@Injectable()
export class PlaceCategoriesService {
  create(createPlaceCategoryDto: CreatePlaceCategoryDto) {
    return 'This action adds a new placeCategory';
  }

  findAll() {
    return `This action returns all placeCategories`;
  }

  findOne(id: number) {
    return `This action returns a #${id} placeCategory`;
  }

  update(id: number, updatePlaceCategoryDto: UpdatePlaceCategoryDto) {
    return `This action updates a #${id} placeCategory`;
  }

  remove(id: number) {
    return `This action removes a #${id} placeCategory`;
  }
}
