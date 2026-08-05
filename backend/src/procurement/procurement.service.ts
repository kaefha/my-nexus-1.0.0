import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { Prisma, PoStatus } from '@prisma/client';

@Injectable()
export class ProcurementService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto & { status?: string }) {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc', status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PurchaseOrderWhereInput = {
      ...(status ? { status: status as PoStatus } : {}),
      ...(search
        ? {
            OR: [
              { poNumber: { contains: search, mode: 'insensitive' } },
              { vendor: { vendorName: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where, skip, take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          rfc: { select: { rfcNumber: true, project: { select: { projectName: true } } } },
          vendor: { select: { vendorName: true } },
          createdBy: { select: { name: true } },
          _count: { select: { items: true, deliveryOrders: true } },
        },
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    return new PaginatedResult(data, total, page, limit);
  }

  async findOne(id: string) {
    return this.prisma.purchaseOrder.findUniqueOrThrow({
      where: { id },
      include: {
        rfc: { include: { project: true } },
        vendor: true,
        createdBy: { select: { id: true, name: true, role: true } },
        items: { include: { material: true } },
        deliveryOrders: true,
      },
    });
  }

  async create(data: any, userId: string) {
    const poCount = await this.prisma.purchaseOrder.count();
    const poNumber = `PO-${new Date().getFullYear()}-${String(poCount + 1).padStart(4, '0')}`;

    return this.prisma.purchaseOrder.create({
      data: {
        poNumber,
        rfcId: data.rfcId,
        vendorId: data.vendorId,
        createdById: userId,
        expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
        totalAmount: data.totalAmount,
        notes: data.notes,
        items: {
          create: data.items?.map((item: any) => ({
            materialId: item.materialId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice ? item.unitPrice * item.quantity : null,
          })) || [],
        },
      },
      include: { items: { include: { material: true } }, vendor: true },
    });
  }

  async updateStatus(id: string, status: PoStatus) {
    return this.prisma.purchaseOrder.update({ where: { id }, data: { status } });
  }

  async getStats() {
    const [total, draft, approved, production, completed] = await Promise.all([
      this.prisma.purchaseOrder.count(),
      this.prisma.purchaseOrder.count({ where: { status: 'DRAFT' } }),
      this.prisma.purchaseOrder.count({ where: { status: 'APPROVED' } }),
      this.prisma.purchaseOrder.count({ where: { status: 'PRODUCTION' } }),
      this.prisma.purchaseOrder.count({ where: { status: 'COMPLETED' } }),
    ]);
    return { total, draft, approved, production, completed };
  }
}
