import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { Place } from '../places/entities/place.entity';
import { PlacesService } from '../places/places.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
    private placesService: PlacesService,
  ) {}

  async getAll() {
    return await this.reportsRepository.find({
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
    const report = this.reportsRepository.create();
    report.place = new Place();
    report.place.id = dto.placeId;
    report.text = dto.text;
    const saved = await this.reportsRepository.save(report);
    return saved;
  }
}
