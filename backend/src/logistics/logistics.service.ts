import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { Prisma, DoStatus } from '@prisma/client';

@Injectable()
export class LogisticsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto & { status?: string }) {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc', status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.DeliveryOrderWhereInput = {
      ...(status ? { status: status as DoStatus } : {}),
      ...(search
        ? {
            OR: [
              { doNumber: { contains: search, mode: 'insensitive' } },
              { driver: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.deliveryOrder.findMany({
        where, skip, take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          purchaseOrder: { select: { poNumber: true, vendor: { select: { vendorName: true } } } },
          destinationWarehouse: { select: { warehouseName: true, location: true } },
          createdBy: { select: { name: true } },
        },
      }),
      this.prisma.deliveryOrder.count({ where }),
    ]);

    return new PaginatedResult(data, total, page, limit);
  }

  async findOne(id: string) {
    return this.prisma.deliveryOrder.findUniqueOrThrow({
      where: { id },
      include: {
        purchaseOrder: { include: { vendor: true, items: { include: { material: true } } } },
        destinationWarehouse: true,
        createdBy: { select: { id: true, name: true, role: true } },
      },
    });
  }

  async create(data: any, userId: string) {
    const doCount = await this.prisma.deliveryOrder.count();
    const doNumber = `DO-${new Date().getFullYear()}-${String(doCount + 1).padStart(4, '0')}`;

    return this.prisma.deliveryOrder.create({
      data: {
        doNumber,
        poId: data.poId,
        createdById: userId,
        vehicle: data.vehicle,
        driver: data.driver,
        driverPhone: data.driverPhone,
        destinationWarehouseId: data.destinationWarehouseId,
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
        notes: data.notes,
      },
      include: { purchaseOrder: true, destinationWarehouse: true },
    });
  }

  async updateStatus(id: string, status: DoStatus) {
    const data: any = { status };
    if (status === 'ARRIVED' || status === 'RECEIVED') {
      data.arrivedDate = new Date();
    }
    return this.prisma.deliveryOrder.update({ where: { id }, data });
  }

  async getStats() {
    const [total, pending, onDelivery, arrived, received] = await Promise.all([
      this.prisma.deliveryOrder.count(),
      this.prisma.deliveryOrder.count({ where: { status: 'PENDING' } }),
      this.prisma.deliveryOrder.count({ where: { status: 'ON_DELIVERY' } }),
      this.prisma.deliveryOrder.count({ where: { status: 'ARRIVED' } }),
      this.prisma.deliveryOrder.count({ where: { status: 'RECEIVED' } }),
    ]);
    return { total, pending, onDelivery, arrived, received };
  }
}
