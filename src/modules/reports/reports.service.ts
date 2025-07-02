import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Between,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from "typeorm";
import { Report } from "./entities/report.entity";
import { CreateReportDto } from "./dto/create-report.dto";
import { ReportsRequestDto } from "./dto/reports-request.dto";
import { ReportsOrderByEnum } from "./enums/reports-order-by.enum";
import { ChangeStatusDto } from "./dto/change-status-dto";
import { StatisticEntitiesEnum } from "./enums/statistic-entities.enum";

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>
  ) {}

  async getAll(dto: ReportsRequestDto) {
    const orderDirection = dto.orderAsc ? "ASC" : "DESC";

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
        entityType:
          !!dto.entityTypes && dto.entityTypes.length > 0
            ? In(dto.entityTypes)
            : undefined,
        status:
          !!dto.statuses && dto.statuses.length > 0
            ? In(dto.statuses)
            : undefined,
        text:
          !!dto.search && dto.search.trim().length > 0
            ? ILike(`%${dto.search || ""}%`)
            : undefined,
      },
      order: {
        createdAt:
          dto.orderBy === ReportsOrderByEnum.CreatedAt || !dto.orderBy
            ? orderDirection
            : undefined,
        place: {
          slug:
            dto.orderBy === ReportsOrderByEnum.EntitySlug
              ? orderDirection
              : undefined,
        },
        excursion: {
          slug:
            dto.orderBy === ReportsOrderByEnum.EntitySlug
              ? orderDirection
              : undefined,
        },
        status:
          dto.orderBy === ReportsOrderByEnum.Status
            ? orderDirection
            : undefined,
        entityType:
          dto.orderBy === ReportsOrderByEnum.EntityType
            ? orderDirection
            : undefined,
        text:
          dto.orderBy === ReportsOrderByEnum.Text ? orderDirection : undefined,
      },
      relations: {
        place: true,
        excursion: true,
      },
      select: {
        place: {
          slug: true,
          id: true,
        },
        excursion: {
          slug: true,
          id: true,
        },
      },
    });
  }

  async create(dto: CreateReportDto) {
    const report = this.reportsRepository.create({
      text: dto.text,
      entityType: dto.entityType,
      place:
        dto.entityType === StatisticEntitiesEnum.Place
          ? {
              id: dto.entityId,
            }
          : undefined,
      excursion:
        dto.entityType === StatisticEntitiesEnum.Excursion
          ? {
              id: dto.entityId,
            }
          : undefined,
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
      throw new BadRequestException({ message: "Report not exists" });

    report.status = dto.status;

    await this.reportsRepository.save(report);
    return;
  }
}
