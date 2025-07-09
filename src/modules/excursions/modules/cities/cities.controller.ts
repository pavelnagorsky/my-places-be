import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseInterceptors,
} from "@nestjs/common";
import { CitiesService } from "./cities.service";
import { CreateCityDto } from "./dto/create-city.dto";
import { UpdateCityDto } from "./dto/update-city.dto";
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
import { ValidationExceptionDto } from "../../../../shared/validation/validation-exception.dto";
import { Auth } from "../../../auth/decorators/auth.decorator";
import { RoleNamesEnum } from "../../../roles/enums/role-names.enum";
import { CityDto } from "./dto/city.dto";
import { CityAdminDto } from "./dto/city-admin.dto";

@ApiTags("Cities")
@Controller("cities")
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @ApiOperation({ summary: "ADMIN: Create City" })
  @ApiOkResponse({
    description: "OK",
  })
  @ApiBadRequestResponse({
    description: "Validation failed",
    type: ValidationExceptionDto,
  })
  @ApiBody({
    type: CreateCityDto,
  })
  @Auth(RoleNamesEnum.ADMIN, RoleNamesEnum.MODERATOR)
  @Post()
  async create(@Body() dto: CreateCityDto) {
    const city = await this.citiesService.create(dto);
    return { id: city.id };
  }

  @ApiOperation({ summary: "ADMIN: Update city" })
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
    description: "The ID of city",
  })
  @ApiBody({
    type: UpdateCityDto,
  })
  @Auth(RoleNamesEnum.ADMIN, RoleNamesEnum.MODERATOR)
  @Put(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateCityDto
  ) {
    const city = await this.citiesService.update(id, dto);
    return { id: city.id };
  }

  @ApiOperation({ summary: "Get all cities by language id" })
  @ApiOkResponse({
    description: "OK",
    type: CityDto,
    isArray: true,
  })
  @ApiQuery({
    name: "lang",
    type: Number,
    description: "The ID of the language",
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async findAll(
    @Query("lang", ParseIntPipe) langId: number
  ): Promise<CityDto[]> {
    const cities = await this.citiesService.findAll(langId);
    return cities.map((r) => new CityDto(r));
  }

  @ApiOperation({ summary: "ADMIN: Get all cities by language id" })
  @ApiOkResponse({
    description: "OK",
    type: CityDto,
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
  ): Promise<CityDto[]> {
    const cities = await this.citiesService.findAll(langId);
    return cities.map((r) => new CityDto(r));
  }

  @ApiOperation({ summary: "ADMIN: Get city by id" })
  @ApiOkResponse({
    description: "OK",
    type: CityAdminDto,
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The ID of city",
  })
  @Auth(RoleNamesEnum.ADMIN)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(":id")
  async findByIdAdmin(@Param("id", ParseIntPipe) id: number) {
    const city = await this.citiesService.findOne(id);
    return new CityAdminDto(city);
  }

  @ApiOperation({ summary: "ADMIN: Delete city by id" })
  @ApiOkResponse({
    description: "OK",
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The ID of city",
  })
  @Auth(RoleNamesEnum.ADMIN)
  @Delete(":id")
  async remove(@Param("id", ParseIntPipe) id: number) {
    return await this.citiesService.remove(id);
  }
}
