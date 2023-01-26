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
import { CreatePermissionDto } from 'src/modules/permission/dto/create-permission.dto';
import { UpdatePermissionDto } from 'src/modules/permission/dto/update-permission.dto';
import { PermissionsService } from 'src/modules/permission/permissions.service';

import { Pagination } from '../paginate';
import { PermissionEntity } from './entities/permission.entity';

@ApiTags('permissions')
@UseGuards(JwtTwoFactorGuard, PermissionGuard)
@Controller('permissions')
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  create(
    @Body()
    createPermissionDto: CreatePermissionDto,
  ): Promise<PermissionEntity> {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  // @ApiQuery({
  //   type: QueryPrisma,
  // })
  findAll(
    @Query()
    permissionFilterDto: QueryPrisma,
  ): Promise<Pagination<PermissionEntity>> {
    return this.permissionsService.findAll(permissionFilterDto);
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ): Promise<PermissionEntity> {
    return this.permissionsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id')
    id: string,
    @Body()
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionEntity> {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id')
    id: string,
  ): Promise<void> {
    return this.permissionsService.remove(id);
  }

  @Post('/sync')
  @HttpCode(HttpStatus.NO_CONTENT)
  syncPermission(): Promise<void> {
    return this.permissionsService.syncPermission();
  }
}
