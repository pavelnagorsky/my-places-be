import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreatePlaceTypeDto } from "./dto/create-place-type.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PlaceType } from "./entities/place-type.entity";
import { Image } from "../../../images/entities/image.entity";
import { PlaceTypeTranslation } from "./entities/place-type-translation.entity";
import { UpdatePlaceTypeDto } from "./dto/update-place-type.dto";
import { TranslationsService } from "../../../translations/translations.service";

@Injectable()
export class PlaceTypesService {
  constructor(
    @InjectRepository(PlaceType)
    private placeTypesRepository: Repository<PlaceType>,
    @InjectRepository(PlaceTypeTranslation)
    private placeTypesTranslationsRepository: Repository<PlaceTypeTranslation>,
    private translationsService: TranslationsService
  ) {}

  // This action adds a new placeType
  async create(dto: CreatePlaceTypeDto) {
    const languages = await this.translationsService.getAllLanguages();
    if (languages.length > dto.titleTranslations.length)
      throw new BadRequestException({ message: "Not all languages set" });

    const translations = dto.titleTranslations.map((dtoTranslation) => {
      return this.placeTypesTranslationsRepository.create({
        text: dtoTranslation.text,
        language: {
          id: dtoTranslation.langId,
        },
        original: true,
      });
    });

    const placeType = this.placeTypesRepository.create({
      titles: translations,
      commercial: dto.commercial,
    });
    if (dto.imageId) {
      placeType.image = new Image();
      placeType.image.id = dto.imageId;
    } else {
      placeType.image = null;
    }
    if (dto.imageId2) {
      placeType.image2 = new Image();
      placeType.image2.id = dto.imageId2;
    } else {
      placeType.image2 = null;
    }

    return await this.placeTypesRepository.save(placeType);
  }

  async update(id: number, dto: UpdatePlaceTypeDto) {
    const type = await this.placeTypesRepository.findOne({
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
    if (!type)
      throw new NotFoundException(`Place type with id ${id} was not found`);

    if (type.titles.length > dto.titleTranslations.length)
      throw new BadRequestException({ message: "Not all languages set" });

    const translations = dto.titleTranslations.map((dtoTranslation, i) => {
      return this.placeTypesTranslationsRepository.create({
        id: type.titles.find(
          (translation) => translation.language.id === dtoTranslation.langId
        )?.id,
        text: dtoTranslation.text,
        language: {
          id: dtoTranslation.langId,
        },
        original: true,
      });
    });

    const placeType = await this.placeTypesRepository.create({
      id: id,
      titles: translations,
      commercial: dto.commercial,
    });
    if (dto.imageId) {
      placeType.image = new Image();
      placeType.image.id = dto.imageId;
    } else {
      placeType.image = null;
    }
    if (dto.imageId2) {
      placeType.image2 = new Image();
      placeType.image2.id = dto.imageId2;
    } else {
      placeType.image2 = null;
    }

    return await this.placeTypesRepository.save(placeType);
  }

  // This action finds all placeTypes by language id
  async findAll(langId: number) {
    return await this.placeTypesRepository.find({
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
    const placeType = await this.placeTypesRepository.findOne({
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
    if (!placeType)
      throw new NotFoundException({
        message: `Place type with id ${id} was not found`,
      });
    return placeType;
  }

  async remove(id: number) {
    const entity = await this.placeTypesRepository.findOne({
      where: { id: id },
      select: { id: true },
    });
    if (!entity)
      throw new NotFoundException({ message: "No place type was found" });
    const deleted = await this.placeTypesRepository.remove([entity]);
    if (!deleted.length)
      throw new NotFoundException({ message: "Can not delete" });
    return { id: id };
  }
}
