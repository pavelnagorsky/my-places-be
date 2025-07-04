import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateCityDto } from "./dto/create-city.dto";
import { UpdateCityDto } from "./dto/update-city.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TranslationsService } from "../../../translations/translations.service";
import { City } from "./entities/city.entity";
import { CityTranslation } from "./entities/city-translation.entity";

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private citiesRepository: Repository<City>,
    @InjectRepository(CityTranslation)
    private cityTranslationsRepository: Repository<CityTranslation>,
    private translationsService: TranslationsService
  ) {}

  // This action adds a new city
  async create(dto: CreateCityDto) {
    const languages = await this.translationsService.getAllLanguages();
    if (languages.length > dto.titleTranslations.length)
      throw new BadRequestException({ message: "Not all languages set" });

    const translations = dto.titleTranslations.map((dtoTranslation) => {
      return this.cityTranslationsRepository.create({
        title: dtoTranslation.text,
        language: {
          id: dtoTranslation.langId,
        },
        original: true,
      });
    });

    const city = this.citiesRepository.create({
      translations: translations,
    });

    return await this.citiesRepository.save(city);
  }

  async update(id: number, dto: UpdateCityDto) {
    const city = await this.citiesRepository.findOne({
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
    if (!city)
      throw new NotFoundException({
        message: `City with id ${id} was not found`,
      });

    if (city.translations.length > dto.titleTranslations.length)
      throw new BadRequestException({ message: "Not all languages set" });

    const translations = dto.titleTranslations.map((dtoTranslation, i) => {
      return this.cityTranslationsRepository.create({
        id: city.translations.find(
          (translation) => translation.language.id === dtoTranslation.langId
        )?.id,
        title: dtoTranslation.text,
        language: {
          id: dtoTranslation.langId,
        },
        original: true,
      });
    });

    const updatedСity = await this.citiesRepository.create({
      id: id,
      translations: translations,
    });

    return await this.citiesRepository.save(updatedСity);
  }

  // This action finds all cities by language id
  async findAll(langId: number) {
    return await this.citiesRepository.find({
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
    const city = await this.citiesRepository.findOne({
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
    if (!city)
      throw new NotFoundException({
        message: `City with id ${id} was not found`,
      });
    return city;
  }

  async remove(id: number) {
    const entity = await this.citiesRepository.findOne({
      where: { id: id },
      select: { id: true },
    });
    if (!entity) throw new NotFoundException({ message: "No city was found" });
    const deleted = await this.citiesRepository.remove([entity]);
    if (!deleted.length)
      throw new NotFoundException({ message: "Can not delete" });
    return { id: id };
  }
}
