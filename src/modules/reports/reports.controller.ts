import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateReportDto } from './dto/create-report.dto';
import { Auth } from '../../auth/decorators/auth.decorator';
import { RoleNamesEnum } from '../roles/enums/role-names.enum';
import { ReportsResponseDto } from './dto/reports-response.dto';
import { ReportsRequestDto } from './dto/reports-request.dto';
import { ChangeStatusDto } from './dto/change-status-dto';

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
  @Post('list')
  async getAll(@Body() dto: ReportsRequestDto) {
    const [reports, total] = await this.reportsService.getAll(dto);
    return new ReportsResponseDto(reports, {
      requestedPage: dto.page,
      pageSize: dto.pageSize,
      totalItems: total,
    });
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

  @ApiOperation({ summary: 'Update report status' })
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The id of the report',
  })
  @ApiBody({
    type: ChangeStatusDto,
  })
  @Auth(RoleNamesEnum.MODERATOR, RoleNamesEnum.ADMIN)
  @Put(':id')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeStatusDto,
  ) {
    await this.reportsService.changeStatus(id, dto);
    return;
  }
}
