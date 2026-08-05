import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProcurementService } from './procurement.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserRole, PoStatus } from '@prisma/client';

@ApiTags('Procurement')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/purchase-orders')
export class ProcurementController {
  constructor(private procurementService: ProcurementService) {}

  @Get()
  @ApiOperation({ summary: 'Get all purchase orders' })
  findAll(@Query() query: PaginationDto & { status?: string }) {
    return this.procurementService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get procurement statistics' })
  getStats() {
    return this.procurementService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase order by ID' })
  findOne(@Param('id') id: string) {
    return this.procurementService.findOne(id);
  }

  @Post()
  @Roles(UserRole.PROCUREMENT, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create purchase order' })
  create(@Body() data: any, @CurrentUser('id') userId: string) {
    return this.procurementService.create(data, userId);
  }

  @Patch(':id/status')
  @Roles(UserRole.PROCUREMENT, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update PO status' })
  updateStatus(@Param('id') id: string, @Body() body: { status: PoStatus }) {
    return this.procurementService.updateStatus(id, body.status);
  }
}
