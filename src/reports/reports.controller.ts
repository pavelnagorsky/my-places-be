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
import { CreateReportDto } from './dto/create-report.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { RoleNamesEnum } from '../roles/enums/role-names.enum';
import { ReportsResponseDto } from './dto/reports-response.dto';
import { ReportsRequestDto } from './dto/reports-request.dto';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({ summary: 'Get all reports' })
  @ApiOkResponse({
    description: 'OK',
    type: ReportsResponseDto,
  })
  @ApiBody({ type: ReportsRequestDto, description: 'request' })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth(RoleNamesEnum.MODERATOR, RoleNamesEnum.ADMIN)
  @Post('List')
  async getAll(@Body() dto: ReportsRequestDto) {
    const [reports, total] = await this.reportsService.getAll(dto);
    const updatedLastIndex = dto.lastIndex + reports.length;
    return new ReportsResponseDto(
      reports,
      updatedLastIndex,
      total > updatedLastIndex,
    );
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
