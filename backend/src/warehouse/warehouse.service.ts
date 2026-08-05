import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class WarehouseService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto) {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { warehouseName: { contains: search, mode: 'insensitive' as const } },
            { location: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.warehouse.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { inventories: true, deliveryOrders: true } },
        },
      }),
      this.prisma.warehouse.count({ where }),
    ]);

    return new PaginatedResult(data, total, page, limit);
  }

  async findOne(id: string) {
    return this.prisma.warehouse.findUniqueOrThrow({
      where: { id },
      include: {
        inventories: {
          include: { material: true },
          orderBy: { lastUpdated: 'desc' },
        },
        deliveryOrders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async getStock(warehouseId: string) {
    return this.prisma.inventory.findMany({
      where: { warehouseId },
      include: { material: true },
      orderBy: { material: { materialName: 'asc' } },
    });
  }

  async receiveMaterial(data: {
    warehouseId: string;
    materialId: string;
    quantity: number;
    referenceType: string;
    referenceId: string;
    userId: string;
    notes?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // Upsert inventory
      await tx.inventory.upsert({
        where: {
          materialId_warehouseId: {
            materialId: data.materialId,
            warehouseId: data.warehouseId,
          },
        },
        update: {
          availableStock: { increment: data.quantity },
          lastUpdated: new Date(),
        },
        create: {
          materialId: data.materialId,
          warehouseId: data.warehouseId,
          availableStock: data.quantity,
          reservedStock: 0,
        },
      });

      // Create stock movement
      return tx.stockMovement.create({
        data: {
          materialId: data.materialId,
          warehouseId: data.warehouseId,
          movementType: 'IN',
          referenceType: data.referenceType as any,
          referenceId: data.referenceId,
          quantity: data.quantity,
          createdById: data.userId,
          notes: data.notes,
        },
      });
    });
  }

  async issueMaterial(data: {
    warehouseId: string;
    materialId: string;
    quantity: number;
    referenceType: string;
    referenceId: string;
    userId: string;
    notes?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // Check available stock
      const inventory = await tx.inventory.findUnique({
        where: {
          materialId_warehouseId: {
            materialId: data.materialId,
            warehouseId: data.warehouseId,
          },
        },
      });

      if (!inventory || inventory.availableStock < data.quantity) {
        throw new Error('Insufficient stock');
      }

      // Update inventory
      await tx.inventory.update({
        where: {
          materialId_warehouseId: {
            materialId: data.materialId,
            warehouseId: data.warehouseId,
          },
        },
        data: {
          availableStock: { decrement: data.quantity },
          lastUpdated: new Date(),
        },
      });

      // Create stock movement
      return tx.stockMovement.create({
        data: {
          materialId: data.materialId,
          warehouseId: data.warehouseId,
          movementType: 'OUT',
          referenceType: data.referenceType as any,
          referenceId: data.referenceId,
          quantity: data.quantity,
          createdById: data.userId,
          notes: data.notes,
        },
      });
    });
  }

  async create(data: any) {
    return this.prisma.warehouse.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.warehouse.update({ where: { id }, data });
  }
}
