import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { PlacesService } from '../places/places.service';
import { ReportsRequestDto } from './dto/reports-request.dto';
import { ReportsOrderByEnum } from './enums/reports-order-by.enum';
import { ChangeStatusDto } from './dto/change-status-dto';

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
      skip: dto.page * dto.pageSize,
      take: dto.pageSize,
      where: {
        createdAt: getDateWhereOption(),
        status:
          !!dto.statuses && dto.statuses.length > 0
            ? In(dto.statuses)
            : undefined,
        text:
          !!dto.search && dto.search.trim().length > 0
            ? ILike(`%${dto.search || ''}%`)
            : undefined,
      },
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
          id: true,
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

  async changeStatus(id: number, dto: ChangeStatusDto) {
    const report = await this.reportsRepository.findOne({
      where: {
        id: id,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!report)
      throw new BadRequestException({ message: 'Report not exists' });

    report.status = dto.status;

    await this.reportsRepository.save(report);
    return;
  }
}
