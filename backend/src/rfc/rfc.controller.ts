import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RfcService } from './rfc.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserRole } from '@prisma/client';

@ApiTags('RFC Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/rfc')
export class RfcController {
  constructor(private rfcService: RfcService) {}

  @Get()
  @ApiOperation({ summary: 'Get all RFCs' })
  findAll(@Query() query: PaginationDto & { status?: string; projectId?: string }) {
    return this.rfcService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get RFC statistics' })
  getStats() {
    return this.rfcService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get RFC by ID' })
  findOne(@Param('id') id: string) {
    return this.rfcService.findOne(id);
  }

  @Post()
  @Roles(UserRole.PMO, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new RFC' })
  create(@Body() data: any, @CurrentUser('id') userId: string) {
    return this.rfcService.create({ ...data, requestorId: userId });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update RFC (draft only)' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.rfcService.update(id, data);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit RFC for approval' })
  submit(@Param('id') id: string) {
    return this.rfcService.submit(id);
  }

  @Post(':id/approve')
  @Roles(UserRole.SITE_MANAGER, UserRole.FINANCE, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Approve RFC' })
  approve(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Body() body: { comments?: string },
  ) {
    return this.rfcService.approve(id, userId, userRole, body?.comments);
  }

  @Post(':id/reject')
  @Roles(UserRole.SITE_MANAGER, UserRole.FINANCE, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Reject RFC' })
  reject(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Body() body: { comments?: string },
  ) {
    return this.rfcService.reject(id, userId, userRole, body?.comments);
  }
}
