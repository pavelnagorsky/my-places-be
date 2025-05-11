import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Put,
  ParseIntPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
} from "@nestjs/common";
import { RegionsService } from "./regions.service";
import { CreateRegionDto } from "./dto/create-region.dto";
import { UpdateRegionDto } from "./dto/update-region.dto";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { ValidationExceptionDto } from "../../shared/validation/validation-exception.dto";
import { CreatePlaceTypeDto } from "../place-types/dto/create-place-type.dto";
import { Auth } from "../auth/decorators/auth.decorator";
import { RoleNamesEnum } from "../roles/enums/role-names.enum";
import { UpdatePlaceTypeDto } from "../place-types/dto/update-place-type.dto";
import { PlaceTypeDto } from "../place-types/dto/place-type.dto";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { PlaceTypeAdminDto } from "../place-types/dto/place-type-admin.dto";
import { RegionDto } from "./dto/region.dto";
import { RegionAdminDto } from "./dto/region-admin.dto";

@ApiTags("Regions")
@Controller("regions")
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @ApiOperation({ summary: "ADMIN: Create Region" })
  @ApiOkResponse({
    description: "OK",
  })
  @ApiBadRequestResponse({
    description: "Validation failed",
    type: ValidationExceptionDto,
  })
  @ApiBody({
    type: CreateRegionDto,
  })
  @Auth(RoleNamesEnum.ADMIN)
  @Post()
  async create(@Body() dto: CreateRegionDto) {
    const region = await this.regionsService.create(dto);
    return { id: region.id };
  }

  @ApiOperation({ summary: "ADMIN: Update Region" })
  @ApiOkResponse({
    description: "OK",
  })
  @ApiBadRequestResponse({
    description: "Validation failed",
    type: ValidationExceptionDto,
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The ID of Region",
  })
  @ApiBody({
    type: UpdateRegionDto,
  })
  @Auth(RoleNamesEnum.ADMIN)
  @Put(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateRegionDto
  ) {
    const region = await this.regionsService.update(id, dto);
    return { id: region.id };
  }

  @ApiOperation({ summary: "Get all Regions by language id" })
  @ApiOkResponse({
    description: "OK",
    type: RegionDto,
    isArray: true,
  })
  @ApiQuery({
    name: "lang",
    type: Number,
    description: "The ID of the language",
  })
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @Get()
  async findAll(
    @Query("lang", ParseIntPipe) langId: number
  ): Promise<RegionDto[]> {
    const regions = await this.regionsService.findAll(langId);
    return regions.map((r) => new RegionDto(r));
  }

  @ApiOperation({ summary: "ADMIN: Get all regions by language id" })
  @ApiOkResponse({
    description: "OK",
    type: RegionDto,
    isArray: true,
  })
  @ApiQuery({
    name: "lang",
    type: Number,
    description: "The ID of the language",
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get("administration")
  async findAllAdmin(
    @Query("lang", ParseIntPipe) langId: number
  ): Promise<RegionDto[]> {
    const regions = await this.regionsService.findAll(langId);
    return regions.map((r) => new RegionDto(r));
  }

  @ApiOperation({ summary: "ADMIN: Get region by id" })
  @ApiOkResponse({
    description: "OK",
    type: RegionAdminDto,
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The ID of Region",
  })
  @Auth(RoleNamesEnum.ADMIN)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(":id")
  async findByIdAdmin(@Param("id", ParseIntPipe) id: number) {
    const region = await this.regionsService.findOne(id);
    return new RegionAdminDto(region);
  }

  @ApiOperation({ summary: "ADMIN: Delete region by id" })
  @ApiOkResponse({
    description: "OK",
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The ID of Region",
  })
  @Auth(RoleNamesEnum.ADMIN)
  @Delete(":id")
  async remove(@Param("id", ParseIntPipe) id: number) {
    return await this.regionsService.remove(id);
  }
}
