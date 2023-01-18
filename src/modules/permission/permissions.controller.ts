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
    UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

import JwtTwoFactorGuard from 'src/common/guard/jwt-two-factor.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { CreatePermissionDto } from 'src/modules/permission/dto/create-permission.dto';
import { PermissionFilterDto } from 'src/modules/permission/dto/permission-filter.dto';
import { UpdatePermissionDto } from 'src/modules/permission/dto/update-permission.dto';
import { PermissionsService } from 'src/modules/permission/permissions.service';
import { PermissionSerializer } from 'src/modules/permission/serializer/permission.serializer';
import { Pagination } from 'src/modules/paginate';

@ApiTags('permissions')
// @UseGuards(JwtTwoFactorGuard, PermissionGuard)
@Controller('permissions')
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  create(
    @Body()
    createPermissionDto: CreatePermissionDto
  ): Promise<PermissionSerializer> {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @ApiQuery({
    type: PermissionFilterDto
  })
  findAll(
    @Query()
    permissionFilterDto: PermissionFilterDto
  ): Promise<PermissionSerializer[]> {
    return this.permissionsService.findAll(permissionFilterDto);
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string
  ): Promise<PermissionSerializer> {
    return this.permissionsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id')
    id: string,
    @Body()
    updatePermissionDto: UpdatePermissionDto
  ): Promise<PermissionSerializer> {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id')
    id: string
  ): Promise<void> {
    return this.permissionsService.remove(id);
  }

  @Post('/sync')
  @HttpCode(HttpStatus.NO_CONTENT)
  syncPermission(): Promise<void> {
    return this.permissionsService.syncPermission();
  }
}
