import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  Put,
  UseInterceptors,
  ClassSerializerInterceptor,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  PickType,
} from '@nestjs/swagger';
import { ValidationExceptionDto } from '../../shared/validation/validation-exception.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Route } from './entities/route.entity';
import { TokenPayload } from '../auth/decorators/token-payload.decorator';
import { UserFromTokenPipe } from '../auth/pipes/user-from-token.pipe';
import { User } from '../users/entities/user.entity';
import { AccessTokenPayloadDto } from '../auth/dto/access-token-payload.dto';
import { RoutesListRequestDto } from './dto/routes-list-request.dto';
import { RoutesListResponseDto } from './dto/routes-list-response.dto';
import { MyPlacesResponseDto } from '../places/dto/my-places-response.dto';
import { RouteDto } from './dto/route.dto';

@ApiTags('Routes')
@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @ApiOperation({ summary: 'Create Route' })
  @ApiOkResponse({
    description: 'OK',
    type: PickType(Route, ['id']),
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ValidationExceptionDto,
  })
  @ApiBody({
    type: CreateRouteDto,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Post()
  async create(
    @TokenPayload(UserFromTokenPipe) user: User,
    @Body() createRouteDto: CreateRouteDto,
  ) {
    return await this.routesService.create(createRouteDto, user);
  }

  @ApiOperation({ summary: 'Get my routes' })
  @ApiOkResponse({
    description: 'OK',
    type: RoutesListResponseDto,
  })
  @ApiBody({
    type: RoutesListRequestDto,
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Post('my-routes')
  async findAll(
    @Query('lang', ParseIntPipe) langId: number,
    @Body() dto: RoutesListRequestDto,
    @TokenPayload()
    tokenPayload: AccessTokenPayloadDto,
  ) {
    const [routes, total] = await this.routesService.findMyRoutes(
      dto,
      langId,
      tokenPayload,
    );

    return new RoutesListResponseDto(routes, {
      requestedPage: dto.page,
      pageSize: dto.pageSize,
      totalItems: total,
    });
  }

  @ApiOperation({ summary: 'Get route by id' })
  @ApiOkResponse({
    description: 'OK',
    type: RouteDto,
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang', ParseIntPipe) langId: number,
    @TokenPayload()
    tokenPayload: AccessTokenPayloadDto,
  ) {
    const route = await this.routesService.findOne(id, langId, tokenPayload.id);
    if (!route) throw new NotFoundException({ message: 'Route not found' });
    return new RouteDto(route);
  }

  @ApiOperation({ summary: 'Update Route' })
  @ApiOkResponse({
    description: 'OK',
    type: PickType(Route, ['id']),
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ValidationExceptionDto,
  })
  @ApiBody({
    type: UpdateRouteDto,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayload() tokenPayload: AccessTokenPayloadDto,
    @Body() updateRouteDto: UpdateRouteDto,
  ) {
    const userIsPlaceAuthor = await this.routesService.checkUserRelation(
      tokenPayload.id,
      id,
    );
    if (!userIsPlaceAuthor)
      throw new ForbiddenException({
        message: 'Forbidden, user is not author',
      });
    return await this.routesService.update(id, updateRouteDto);
  }

  @ApiOperation({ summary: 'Delete Route' })
  @ApiOkResponse({
    description: 'OK',
    type: PickType(Route, ['id']),
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the route',
  })
  @Auth()
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayload() tokenPayload: AccessTokenPayloadDto,
  ) {
    const userIsPlaceAuthor = await this.routesService.checkUserRelation(
      tokenPayload.id,
      id,
    );
    if (!userIsPlaceAuthor)
      throw new ForbiddenException({
        message: 'Forbidden, user is not author',
      });
    return await this.routesService.remove(id);
  }
}
