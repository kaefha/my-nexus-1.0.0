import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const [
      totalMaterials,
      activeProjects,
      pendingRfc,
      activePo,
      onDelivery,
      pendingTransfers,
      totalWarehouses,
    ] = await Promise.all([
      this.prisma.materialMaster.count({ where: { isActive: true } }),
      this.prisma.project.count({ where: { status: 'ACTIVE' } }),
      this.prisma.rfc.count({
        where: { status: { in: ['WAITING_SITE_APPROVAL', 'WAITING_FINANCE_APPROVAL', 'SUBMITTED'] } },
      }),
      this.prisma.purchaseOrder.count({
        where: { status: { in: ['APPROVED', 'PRODUCTION'] } },
      }),
      this.prisma.deliveryOrder.count({
        where: { status: { in: ['PENDING', 'ON_DELIVERY'] } },
      }),
      this.prisma.materialTransfer.count({
        where: { approvalStatus: 'WAITING_APPROVAL' },
      }),
      this.prisma.warehouse.count({ where: { isActive: true } }),
    ]);

    return {
      totalMaterials,
      activeProjects,
      pendingRfc,
      activePo,
      onDelivery,
      pendingTransfers,
      totalWarehouses,
    };
  }

  async getLowStockAlerts() {
    const alerts = await this.prisma.$queryRaw<any[]>`
      SELECT i.id, i."availableStock", i."minimumStock",
             m."materialName", m."materialCode", m.unit,
             w."warehouseName"
      FROM inventories i
      JOIN material_masters m ON i."materialId" = m.id
      JOIN warehouses w ON i."warehouseId" = w.id
      WHERE i."availableStock" <= i."minimumStock"
      ORDER BY (i."availableStock" - i."minimumStock") ASC
      LIMIT 10
    `;
    return alerts;
  }

  async getRecentActivities() {
    const [recentRfcs, recentPos, recentMovements] = await Promise.all([
      this.prisma.rfc.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true, rfcNumber: true, status: true, updatedAt: true,
          project: { select: { projectName: true } },
        },
      }),
      this.prisma.purchaseOrder.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true, poNumber: true, status: true, updatedAt: true,
          vendor: { select: { vendorName: true } },
        },
      }),
      this.prisma.stockMovement.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        select: {
          id: true, movementType: true, quantity: true, date: true,
          material: { select: { materialName: true, unit: true } },
          warehouse: { select: { warehouseName: true } },
        },
      }),
    ]);

    return { recentRfcs, recentPos, recentMovements };
  }

  async getWarehouseCapacity() {
    const warehouses = await this.prisma.warehouse.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { inventories: true } },
        inventories: {
          select: { availableStock: true, reservedStock: true },
        },
      },
    });

    return warehouses.map((wh) => ({
      id: wh.id,
      name: wh.warehouseName,
      location: wh.location,
      capacity: wh.capacity,
      totalItems: wh._count.inventories,
      totalStock: wh.inventories.reduce((sum, inv) => sum + inv.availableStock + inv.reservedStock, 0),
    }));
  }

  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async markNotificationRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async getNotificationCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
}
