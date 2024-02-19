import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { Place } from '../places/entities/place.entity';
import { PlacesService } from '../places/places.service';
import { ReportsRequestDto } from './dto/reports-request.dto';
import { ReportsOrderByEnum } from './enums/reports-order-by.enum';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
    private placesService: PlacesService,
  ) {}

  async getAll(dto: ReportsRequestDto) {
    const orderDirection = dto.orderAsc ? 'ASC' : 'DESC';

    const getDateWhereOption = () => {
      if (!!dto.dateFrom && !!dto.dateTo)
        return Between(new Date(dto.dateFrom), new Date(dto.dateTo));
      if (!!dto.dateFrom) return MoreThanOrEqual(new Date(dto.dateFrom));
      if (!!dto.dateTo) return LessThanOrEqual(new Date(dto.dateTo));
      return undefined;
    };

    return await this.reportsRepository.findAndCount({
      skip: dto.lastIndex,
      take: dto.itemsPerPage,
      order: {
        createdAt:
          dto.orderBy === ReportsOrderByEnum.CREATED_AT || !dto.orderBy
            ? orderDirection
            : undefined,
        place: {
          slug:
            dto.orderBy === ReportsOrderByEnum.PLACE_SLUG
              ? orderDirection
              : undefined,
        },
        status:
          dto.orderBy === ReportsOrderByEnum.STATUS
            ? orderDirection
            : undefined,
        text:
          dto.orderBy === ReportsOrderByEnum.TEXT ? orderDirection : undefined,
      },
      relations: {
        place: true,
      },
      select: {
        place: {
          slug: true,
        },
      },
    });
  }

  async create(dto: CreateReportDto) {
    const placeExists = await this.placesService.checkExist(dto.placeId);
    if (!placeExists)
      throw new BadRequestException({ message: 'Place not exists' });
    const report = this.reportsRepository.create({
      text: dto.text,
      place: {
        id: dto.placeId,
      },
    });
    const saved = await this.reportsRepository.save(report);
    return saved;
  }
}
