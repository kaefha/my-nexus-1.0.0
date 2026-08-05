import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TransferService } from './transfer.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserRole, TransferStatus } from '@prisma/client';

@ApiTags('Material Transfer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/transfers')
export class TransferController {
  constructor(private transferService: TransferService) {}

  @Get()
  @ApiOperation({ summary: 'Get all transfers' })
  findAll(@Query() query: PaginationDto & { status?: string }) {
    return this.transferService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transfer by ID' })
  findOne(@Param('id') id: string) {
    return this.transferService.findOne(id);
  }

  @Post()
  @Roles(UserRole.SUPERVISOR_SITE, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create transfer request' })
  create(@Body() data: any, @CurrentUser('id') userId: string) {
    return this.transferService.create(data, userId);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit transfer for approval' })
  submit(@Param('id') id: string) {
    return this.transferService.submit(id);
  }

  @Post(':id/approve')
  @Roles(UserRole.SITE_MANAGER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Approve transfer request' })
  approve(@Param('id') id: string, @CurrentUser('role') userRole: UserRole) {
    return this.transferService.approve(id, userRole);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update transfer status' })
  updateStatus(@Param('id') id: string, @Body() body: { status: TransferStatus }) {
    return this.transferService.updateStatus(id, body.status);
  }
}
