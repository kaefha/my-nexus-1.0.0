import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get('stock-balance')
  @ApiOperation({ summary: 'Get stock balance across warehouses' })
  getStockBalance(@Query() query: PaginationDto & { warehouseId?: string; category?: string }) {
    return this.inventoryService.getStockBalance(query);
  }

  @Get('movements')
  @ApiOperation({ summary: 'Get stock movement history' })
  getMovements(@Query() query: PaginationDto & { warehouseId?: string; materialId?: string; type?: string }) {
    return this.inventoryService.getMovements(query);
  }

  @Get('catalog')
  @ApiOperation({ summary: 'Get material catalog' })
  getMaterialCatalog(@Query() query: PaginationDto & { category?: string }) {
    return this.inventoryService.getMaterialCatalog(query);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low stock alerts' })
  getLowStockAlerts() {
    return this.inventoryService.getLowStockAlertsRaw();
  }
}
