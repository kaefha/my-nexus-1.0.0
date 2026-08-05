import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { Prisma, RfcStatus, UserRole } from '@prisma/client';

@Injectable()
export class RfcService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto & { status?: string; projectId?: string }) {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc', status, projectId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.RfcWhereInput = {
      ...(status ? { status: status as RfcStatus } : {}),
      ...(projectId ? { projectId } : {}),
      ...(search
        ? {
            OR: [
              { rfcNumber: { contains: search, mode: 'insensitive' } },
              { location: { contains: search, mode: 'insensitive' } },
              { project: { projectName: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.rfc.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          project: { select: { id: true, projectName: true } },
          requestor: { select: { id: true, name: true, role: true } },
          items: { include: { material: { select: { materialCode: true, materialName: true, unit: true } } } },
          approvals: { include: { approver: { select: { id: true, name: true, role: true } } } },
          _count: { select: { items: true } },
        },
      }),
      this.prisma.rfc.count({ where }),
    ]);

    return new PaginatedResult(data, total, page, limit);
  }

  async findOne(id: string) {
    return this.prisma.rfc.findUniqueOrThrow({
      where: { id },
      include: {
        project: true,
        requestor: { select: { id: true, name: true, email: true, role: true } },
        items: { include: { material: true } },
        approvals: {
          include: { approver: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
        purchaseOrders: { select: { id: true, poNumber: true, status: true } },
      },
    });
  }

  async create(data: {
    projectId: string;
    location: string;
    storageLocation?: string;
    requestorId: string;
    notes?: string;
    items: { materialId: string; description?: string; requestQty: number; notes?: string }[];
  }) {
    const rfcCount = await this.prisma.rfc.count();
    const rfcNumber = `RFC-${new Date().getFullYear()}-${String(rfcCount + 1).padStart(4, '0')}`;

    return this.prisma.rfc.create({
      data: {
        rfcNumber,
        projectId: data.projectId,
        location: data.location,
        storageLocation: data.storageLocation,
        requestorId: data.requestorId,
        notes: data.notes,
        status: 'DRAFT',
        items: {
          create: data.items.map((item) => ({
            materialId: item.materialId,
            description: item.description,
            requestQty: item.requestQty,
            notes: item.notes,
            status: 'PENDING',
          })),
        },
      },
      include: { items: { include: { material: true } }, project: true },
    });
  }

  async update(id: string, data: Prisma.RfcUpdateInput) {
    const rfc = await this.prisma.rfc.findUniqueOrThrow({ where: { id } });
    if (rfc.status !== 'DRAFT') {
      throw new BadRequestException('Only DRAFT RFC can be updated');
    }
    return this.prisma.rfc.update({ where: { id }, data });
  }

  async submit(id: string) {
    const rfc = await this.prisma.rfc.findUniqueOrThrow({ where: { id } });
    if (rfc.status !== 'DRAFT') {
      throw new BadRequestException('Only DRAFT RFC can be submitted');
    }

    return this.prisma.rfc.update({
      where: { id },
      data: { status: 'WAITING_SITE_APPROVAL' },
    });
  }

  async approve(id: string, userId: string, userRole: UserRole, comments?: string) {
    const rfc = await this.prisma.rfc.findUniqueOrThrow({
      where: { id },
      include: { items: true },
    });

    let newStatus: RfcStatus;
    let approvalStep: string;

    if (rfc.status === 'WAITING_SITE_APPROVAL' && userRole === UserRole.SITE_MANAGER) {
      newStatus = RfcStatus.WAITING_FINANCE_APPROVAL;
      approvalStep = 'SITE_MANAGER';
    } else if (rfc.status === 'WAITING_FINANCE_APPROVAL' && userRole === UserRole.FINANCE) {
      newStatus = RfcStatus.APPROVED;
      approvalStep = 'FINANCE';
    } else {
      throw new ForbiddenException('You cannot approve this RFC at its current stage');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.rfcApproval.create({
        data: {
          rfcId: id,
          approverId: userId,
          action: 'APPROVED',
          comments,
          step: approvalStep,
        },
      });

      // If fully approved, also approve all items
      const updateData: Prisma.RfcUpdateInput = { status: newStatus };

      if (newStatus === RfcStatus.APPROVED) {
        await tx.rfcItem.updateMany({
          where: { rfcId: id },
          data: {
            status: 'APPROVED',
            approvedQty: undefined, // Will be set in a loop
          },
        });

        // Set approved qty = request qty for all items
        for (const item of rfc.items) {
          await tx.rfcItem.update({
            where: { id: item.id },
            data: { approvedQty: item.requestQty, status: 'APPROVED' },
          });
        }
      }

      return tx.rfc.update({
        where: { id },
        data: updateData,
        include: { items: true, approvals: true },
      });
    });
  }

  async reject(id: string, userId: string, userRole: UserRole, comments?: string) {
    const rfc = await this.prisma.rfc.findUniqueOrThrow({ where: { id } });

    if (!['WAITING_SITE_APPROVAL', 'WAITING_FINANCE_APPROVAL'].includes(rfc.status)) {
      throw new BadRequestException('RFC cannot be rejected at this stage');
    }

    const approvalStep =
      rfc.status === 'WAITING_SITE_APPROVAL' ? 'SITE_MANAGER' : 'FINANCE';

    return this.prisma.$transaction(async (tx) => {
      await tx.rfcApproval.create({
        data: {
          rfcId: id,
          approverId: userId,
          action: 'REJECTED',
          comments,
          step: approvalStep,
        },
      });

      return tx.rfc.update({
        where: { id },
        data: { status: 'REJECTED' },
      });
    });
  }

  async getStats() {
    const [total, draft, pending, approved, rejected] = await Promise.all([
      this.prisma.rfc.count(),
      this.prisma.rfc.count({ where: { status: 'DRAFT' } }),
      this.prisma.rfc.count({
        where: { status: { in: ['WAITING_SITE_APPROVAL', 'WAITING_FINANCE_APPROVAL', 'SUBMITTED'] } },
      }),
      this.prisma.rfc.count({ where: { status: 'APPROVED' } }),
      this.prisma.rfc.count({ where: { status: 'REJECTED' } }),
    ]);
    return { total, draft, pending, approved, rejected };
  }
}
