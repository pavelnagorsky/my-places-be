import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import {
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RoleDto } from './dto/role.dto';
import { RoleNamesEnum } from './enums/role-names.enum';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @ApiOperation({ summary: 'Create Role' })
  @ApiOkResponse({
    description: 'OK',
    type: RoleDto,
  })
  @ApiBody({ type: CreateRoleDto })
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @ApiOperation({ summary: 'Get role by name' })
  @ApiOkResponse({
    description: 'OK',
    type: RoleDto,
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
  })
  @ApiParam({
    name: 'name',
    enum: RoleNamesEnum,
    description: 'Name of the role',
  })
  @Get(':name')
  async getRoleByName(@Param('name') name: RoleNamesEnum) {
    const role = await this.rolesService.getRoleByName(name);
    if (!role) throw new NotFoundException();
    return new RoleDto(role);
  }
}
