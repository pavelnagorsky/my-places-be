import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateRegionDto } from "./dto/create-region.dto";
import { UpdateRegionDto } from "./dto/update-region.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { PlaceType } from "../place-types/entities/place-type.entity";
import { Repository } from "typeorm";
import { PlaceTypeTranslation } from "../place-types/entities/place-type-translation.entity";
import { TranslationsService } from "../translations/translations.service";
import { Region } from "./entities/region.entity";
import { RegionTranslation } from "./entities/region-translation.entity";
import { CreatePlaceTypeDto } from "../place-types/dto/create-place-type.dto";
import { Image } from "../images/entities/image.entity";
import { UpdatePlaceTypeDto } from "../place-types/dto/update-place-type.dto";

@Injectable()
export class RegionsService {
  constructor(
    @InjectRepository(Region)
    private regionsRepository: Repository<Region>,
    @InjectRepository(RegionTranslation)
    private regionTranslationsRepository: Repository<RegionTranslation>,
    private translationsService: TranslationsService
  ) {}

  // This action adds a new Region
  async create(dto: CreateRegionDto) {
    const languages = await this.translationsService.getAllLanguages();
    if (languages.length > dto.titleTranslations.length)
      throw new BadRequestException({ message: "Not all languages set" });

    const translations = dto.titleTranslations.map((dtoTranslation) => {
      return this.regionTranslationsRepository.create({
        title: dtoTranslation.text,
        language: {
          id: dtoTranslation.langId,
        },
        original: true,
      });
    });

    const region = this.regionsRepository.create({
      translations: translations,
    });

    return await this.regionsRepository.save(region);
  }

  async update(id: number, dto: UpdateRegionDto) {
    const region = await this.regionsRepository.findOne({
      where: { id: id },
      relations: {
        translations: {
          language: true,
        },
      },
      select: {
        id: true,
        translations: true,
      },
    });
    if (!region)
      throw new NotFoundException({
        message: `Region with id ${id} was not found`,
      });

    if (region.translations.length > dto.titleTranslations.length)
      throw new BadRequestException({ message: "Not all languages set" });

    const translations = dto.titleTranslations.map((dtoTranslation, i) => {
      return this.regionTranslationsRepository.create({
        id: region.translations.find(
          (translation) => translation.language.id === dtoTranslation.langId
        )?.id,
        title: dtoTranslation.text,
        language: {
          id: dtoTranslation.langId,
        },
        original: true,
      });
    });

    const updatedRegion = await this.regionsRepository.create({
      id: id,
      translations: translations,
    });

    return await this.regionsRepository.save(updatedRegion);
  }

  // This action finds all regions by language id
  async findAll(langId: number) {
    return await this.regionsRepository.find({
      relations: {
        translations: true,
      },
      order: {
        translations: {
          title: "asc",
        },
      },
      where: {
        translations: {
          language: {
            id: langId,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const region = await this.regionsRepository.findOne({
      relations: {
        translations: {
          language: true,
        },
      },
      where: {
        id: id,
      },
      order: {
        translations: {
          language: {
            id: "asc",
          },
        },
      },
    });
    if (!region)
      throw new NotFoundException({
        message: `Region with id ${id} was not found`,
      });
    return region;
  }

  async remove(id: number) {
    const entity = await this.regionsRepository.findOne({
      where: { id: id },
      select: { id: true },
    });
    if (!entity)
      throw new NotFoundException({ message: "No region was found" });
    const deleted = await this.regionsRepository.remove([entity]);
    if (!deleted.length)
      throw new NotFoundException({ message: "Can not delete" });
    return { id: id };
  }
}
