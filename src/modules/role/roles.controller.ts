import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import JwtTwoFactorGuard from 'src/common/guard/jwt-two-factor.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { QueryPrisma } from 'src/common/repository/query-buider-frontend/interfaces/Query';
import { CreateRoleDto } from 'src/modules/role/dto/create-role.dto';
import { UpdateRoleDto } from 'src/modules/role/dto/update-role.dto';
import { RolesService } from 'src/modules/role/roles.service';

import { Pagination } from '../paginate';
import { RoleEntity } from './entities/role.entity';

@ApiTags('roles')
@UseGuards(JwtTwoFactorGuard, PermissionGuard)
@Controller('roles')
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(
    @Body()
    createRoleDto: CreateRoleDto,
  ): Promise<RoleEntity> {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  // @ApiQuery({
  //   type: QueryPrisma,
  // })
  findAll(
    @Query()
    roleFilterDto: QueryPrisma,
  ): Promise<Pagination<RoleEntity>> {
    return this.rolesService.findAll(roleFilterDto);
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ): Promise<RoleEntity> {
    return this.rolesService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id')
    id: string,
    @Body()
    updateRoleDto: UpdateRoleDto,
  ): Promise<RoleEntity> {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id')
    id: string,
  ): Promise<void> {
    return this.rolesService.remove(id);
  }
}
