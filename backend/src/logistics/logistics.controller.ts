import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LogisticsService } from './logistics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserRole, DoStatus } from '@prisma/client';

@ApiTags('Logistics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/delivery-orders')
export class LogisticsController {
  constructor(private logisticsService: LogisticsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all delivery orders' })
  findAll(@Query() query: PaginationDto & { status?: string }) {
    return this.logisticsService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get logistics statistics' })
  getStats() {
    return this.logisticsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get delivery order by ID' })
  findOne(@Param('id') id: string) {
    return this.logisticsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.LOGISTICS, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create delivery order' })
  create(@Body() data: any, @CurrentUser('id') userId: string) {
    return this.logisticsService.create(data, userId);
  }

  @Patch(':id/status')
  @Roles(UserRole.LOGISTICS, UserRole.WAREHOUSE_SUPERVISOR, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update delivery status' })
  updateStatus(@Param('id') id: string, @Body() body: { status: DoStatus }) {
    return this.logisticsService.updateStatus(id, body.status);
  }
}
