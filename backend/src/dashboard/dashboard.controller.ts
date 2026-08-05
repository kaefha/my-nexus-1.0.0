import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get dashboard KPI overview' })
  getOverview() {
    return this.dashboardService.getOverview();
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low stock alerts' })
  getLowStockAlerts() {
    return this.dashboardService.getLowStockAlerts();
  }

  @Get('activities')
  @ApiOperation({ summary: 'Get recent activities' })
  getRecentActivities() {
    return this.dashboardService.getRecentActivities();
  }

  @Get('warehouses')
  @ApiOperation({ summary: 'Get warehouse capacity overview' })
  getWarehouseCapacity() {
    return this.dashboardService.getWarehouseCapacity();
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Get user notifications' })
  getNotifications(@CurrentUser('id') userId: string) {
    return this.dashboardService.getNotifications(userId);
  }

  @Get('notifications/count')
  @ApiOperation({ summary: 'Get unread notification count' })
  getNotificationCount(@CurrentUser('id') userId: string) {
    return this.dashboardService.getNotificationCount(userId);
  }

  @Patch('notifications/:id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markNotificationRead(@Param('id') id: string) {
    return this.dashboardService.markNotificationRead(id);
  }
}
