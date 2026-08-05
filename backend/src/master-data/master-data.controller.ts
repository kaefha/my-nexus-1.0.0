import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MasterDataService } from './master-data.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserRole } from '@prisma/client';

@ApiTags('Master Data')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/master')
export class MasterDataController {
  constructor(private masterDataService: MasterDataService) {}

  // ===== MATERIALS =====
  @Get('materials')
  @ApiOperation({ summary: 'Get all materials' })
  findAllMaterials(@Query() query: PaginationDto & { category?: string }) {
    return this.masterDataService.findAllMaterials(query);
  }

  @Post('materials')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create material' })
  createMaterial(@Body() data: any) {
    return this.masterDataService.createMaterial(data);
  }

  @Patch('materials/:id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update material' })
  updateMaterial(@Param('id') id: string, @Body() data: any) {
    return this.masterDataService.updateMaterial(id, data);
  }

  @Delete('materials/:id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete material' })
  deleteMaterial(@Param('id') id: string) {
    return this.masterDataService.deleteMaterial(id);
  }

  // ===== VENDORS =====
  @Get('vendors')
  @ApiOperation({ summary: 'Get all vendors' })
  findAllVendors(@Query() query: PaginationDto) {
    return this.masterDataService.findAllVendors(query);
  }

  @Post('vendors')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PROCUREMENT)
  @ApiOperation({ summary: 'Create vendor' })
  createVendor(@Body() data: any) {
    return this.masterDataService.createVendor(data);
  }

  @Patch('vendors/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PROCUREMENT)
  @ApiOperation({ summary: 'Update vendor' })
  updateVendor(@Param('id') id: string, @Body() data: any) {
    return this.masterDataService.updateVendor(id, data);
  }

  @Delete('vendors/:id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete vendor' })
  deleteVendor(@Param('id') id: string) {
    return this.masterDataService.deleteVendor(id);
  }

  // ===== USERS =====
  @Get('users')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all users' })
  findAllUsers(@Query() query: PaginationDto & { role?: string }) {
    return this.masterDataService.findAllUsers(query);
  }

  @Post('users')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create user' })
  createUser(@Body() data: any) {
    return this.masterDataService.createUser(data);
  }

  @Patch('users/:id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update user' })
  updateUser(@Param('id') id: string, @Body() data: any) {
    return this.masterDataService.updateUser(id, data);
  }

  // ===== UNITS & CATEGORIES =====
  @Get('units')
  @ApiOperation({ summary: 'Get all units' })
  getUnits() {
    return this.masterDataService.getUnits();
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get material categories' })
  getCategories() {
    return this.masterDataService.getCategories();
  }
}
