import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreatePlaceCategoryDto } from "./dto/create-place-category.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PlaceCategory } from "./entities/place-category.entity";
import { Image } from "../../../images/entities/image.entity";
import { UpdatePlaceCategoryDto } from "./dto/update-place-category.dto";
import { PlaceCategoryTranslation } from "./entities/place-category-translation.entity";
import { TranslationsService } from "../../../translations/translations.service";

@Injectable()
export class PlaceCategoriesService {
  constructor(
    @InjectRepository(PlaceCategory)
    private placeCategoriesRepository: Repository<PlaceCategory>,
    @InjectRepository(PlaceCategoryTranslation)
    private placeCategoriesTranslationsRepository: Repository<PlaceCategoryTranslation>,
    private translationsService: TranslationsService
  ) {}

  async create(dto: CreatePlaceCategoryDto) {
    const languages = await this.translationsService.getAllLanguages();
    if (languages.length > dto.titleTranslations.length)
      throw new BadRequestException({ message: "Not all languages set" });

    const translations = dto.titleTranslations.map((dtoTranslation) => {
      return this.placeCategoriesTranslationsRepository.create({
        text: dtoTranslation.text,
        language: {
          id: dtoTranslation.langId,
        },
        original: true,
      });
    });

    const placeCategory = await this.placeCategoriesRepository.create({
      titles: translations,
    });
    if (dto.imageId) {
      placeCategory.image = new Image();
      placeCategory.image.id = dto.imageId;
    } else {
      placeCategory.image = null;
    }
    if (dto.imageId2) {
      placeCategory.image2 = new Image();
      placeCategory.image2.id = dto.imageId2;
    } else {
      placeCategory.image2 = null;
    }

    return await this.placeCategoriesRepository.save(placeCategory);
  }

  async update(id: number, dto: UpdatePlaceCategoryDto) {
    const category = await this.placeCategoriesRepository.findOne({
      where: { id: id },
      relations: {
        titles: {
          language: true,
        },
      },
      select: {
        id: true,
        titles: true,
      },
    });
    if (!category)
      throw new NotFoundException(`Place category with id ${id} was not found`);

    if (category.titles.length > dto.titleTranslations.length)
      throw new BadRequestException({ message: "Not all languages set" });

    const translations = dto.titleTranslations.map((dtoTranslation, i) => {
      return this.placeCategoriesTranslationsRepository.create({
        id: category.titles.find(
          (translation) => translation.language.id === dtoTranslation.langId
        )?.id,
        text: dtoTranslation.text,
        language: {
          id: dtoTranslation.langId,
        },
        original: true,
      });
    });

    const placeCategory = await this.placeCategoriesRepository.create({
      id: id,
      titles: translations,
    });
    if (dto.imageId) {
      placeCategory.image = new Image();
      placeCategory.image.id = dto.imageId;
    } else {
      placeCategory.image = null;
    }
    if (dto.imageId2) {
      placeCategory.image2 = new Image();
      placeCategory.image2.id = dto.imageId2;
    } else {
      placeCategory.image2 = null;
    }

    return await this.placeCategoriesRepository.save(placeCategory);
  }

  async findAll(langId: number) {
    return await this.placeCategoriesRepository.find({
      relations: {
        image: true,
        image2: true,
        titles: true,
      },
      order: {
        titles: {
          text: "asc",
        },
      },
      where: {
        titles: {
          language: {
            id: langId,
          },
        },
      },
    });
  }

  async findOneAdministration(id: number) {
    const placeCategory = await this.placeCategoriesRepository.findOne({
      relations: {
        image: true,
        image2: true,
        titles: {
          language: true,
        },
      },
      where: {
        id: id,
      },
      order: {
        titles: {
          language: {
            id: "asc",
          },
        },
      },
    });
    if (!placeCategory)
      throw new NotFoundException({
        message: `Place category with id ${id} was not found`,
      });
    return placeCategory;
  }

  async remove(id: number) {
    const entity = await this.placeCategoriesRepository.findOne({
      where: { id: id },
      select: { id: true },
    });
    if (!entity)
      throw new NotFoundException({ message: "No category was found" });
    const deleted = await this.placeCategoriesRepository.remove([entity]);
    if (!deleted.length)
      throw new NotFoundException({ message: "Can not delete" });
    return { id: id };
  }
}
