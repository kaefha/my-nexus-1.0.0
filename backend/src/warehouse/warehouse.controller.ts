import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WarehouseService } from './warehouse.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserRole } from '@prisma/client';

@ApiTags('Warehouse')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/warehouses')
export class WarehouseController {
  constructor(private warehouseService: WarehouseService) {}

  @Get()
  @ApiOperation({ summary: 'Get all warehouses' })
  findAll(@Query() query: PaginationDto) {
    return this.warehouseService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get warehouse by ID' })
  findOne(@Param('id') id: string) {
    return this.warehouseService.findOne(id);
  }

  @Get(':id/stock')
  @ApiOperation({ summary: 'Get warehouse stock' })
  getStock(@Param('id') id: string) {
    return this.warehouseService.getStock(id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create warehouse' })
  create(@Body() data: any) {
    return this.warehouseService.create(data);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_SUPERVISOR)
  @ApiOperation({ summary: 'Update warehouse' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.warehouseService.update(id, data);
  }

  @Post(':id/receive')
  @Roles(UserRole.WAREHOUSE_SUPERVISOR, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Receive material into warehouse' })
  receive(@Param('id') id: string, @Body() data: any, @CurrentUser('id') userId: string) {
    return this.warehouseService.receiveMaterial({ ...data, warehouseId: id, userId });
  }

  @Post(':id/issue')
  @Roles(UserRole.WAREHOUSE_SUPERVISOR, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Issue material from warehouse' })
  issue(@Param('id') id: string, @Body() data: any, @CurrentUser('id') userId: string) {
    return this.warehouseService.issueMaterial({ ...data, warehouseId: id, userId });
  }
}
