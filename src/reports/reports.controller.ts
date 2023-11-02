import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportDto } from './dto/report.dto';
import { CreateReportDto } from './dto/create-report.dto';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({ summary: 'Get all reports' })
  @ApiOkResponse({
    description: 'OK',
    type: ReportDto,
    isArray: true,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async getAll() {
    const reports = await this.reportsService.getAll();
    return reports.map((r) => new ReportDto(r));
  }

  @ApiOperation({ summary: 'Create report' })
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiBody({
    type: CreateReportDto,
  })
  @Post()
  async create(@Body() dto: CreateReportDto) {
    await this.reportsService.create(dto);
    return;
  }
}
