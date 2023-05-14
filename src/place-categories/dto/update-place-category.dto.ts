import { PartialType } from '@nestjs/swagger';
import { CreatePlaceCategoryDto } from './create-place-category.dto';

export class UpdatePlaceCategoryDto extends PartialType(CreatePlaceCategoryDto) {}
