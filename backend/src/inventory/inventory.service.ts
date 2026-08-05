import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getStockBalance(query: PaginationDto & { warehouseId?: string; category?: string }) {
    const { page = 1, limit = 20, search, warehouseId, category } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(warehouseId ? { warehouseId } : {}),
      ...(category ? { material: { category } } : {}),
      ...(search
        ? {
            material: {
              OR: [
                { materialName: { contains: search, mode: 'insensitive' } },
                { materialCode: { contains: search, mode: 'insensitive' } },
              ],
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.inventory.findMany({
        where, skip, take: limit,
        include: {
          material: true,
          warehouse: { select: { warehouseName: true, location: true } },
        },
        orderBy: { lastUpdated: 'desc' },
      }),
      this.prisma.inventory.count({ where }),
    ]);

    return new PaginatedResult(data, total, page, limit);
  }

  async getMovements(query: PaginationDto & { warehouseId?: string; materialId?: string; type?: string }) {
    const { page = 1, limit = 20, warehouseId, materialId, type } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(warehouseId ? { warehouseId } : {}),
      ...(materialId ? { materialId } : {}),
      ...(type ? { movementType: type } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where, skip, take: limit,
        include: {
          material: { select: { materialCode: true, materialName: true, unit: true } },
          warehouse: { select: { warehouseName: true } },
          createdBy: { select: { name: true } },
        },
        orderBy: { date: 'desc' },
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    return new PaginatedResult(data, total, page, limit);
  }

  async getMaterialCatalog(query: PaginationDto & { category?: string }) {
    const { page = 1, limit = 20, search, category } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(category ? { category } : {}),
      ...(search
        ? {
            OR: [
              { materialName: { contains: search, mode: 'insensitive' } },
              { materialCode: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.materialMaster.findMany({
        where, skip, take: limit,
        include: {
          inventories: {
            include: { warehouse: { select: { warehouseName: true } } },
          },
        },
        orderBy: { materialName: 'asc' },
      }),
      this.prisma.materialMaster.count({ where }),
    ]);

    return new PaginatedResult(data, total, page, limit);
  }

  async getLowStockAlerts() {
    return this.prisma.inventory.findMany({
      where: {
        availableStock: { lte: this.prisma.inventory.fields.minimumStock as any },
      },
      include: {
        material: true,
        warehouse: { select: { warehouseName: true } },
      },
    });
  }

  async getLowStockAlertsRaw() {
    return this.prisma.$queryRaw`
      SELECT i.*, m."materialName", m."materialCode", m.unit, w."warehouseName"
      FROM inventories i
      JOIN material_masters m ON i."materialId" = m.id
      JOIN warehouses w ON i."warehouseId" = w.id
      WHERE i."availableStock" <= i."minimumStock"
      ORDER BY (i."availableStock" - i."minimumStock") ASC
    `;
  }
}
