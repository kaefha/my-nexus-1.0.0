import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { TransferStatus, UserRole } from '@prisma/client';

@Injectable()
export class TransferService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto & { status?: string }) {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc', status } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(status ? { approvalStatus: status } : {}),
      ...(search
        ? {
            OR: [
              { transferNumber: { contains: search, mode: 'insensitive' } },
              { materialName: { contains: search, mode: 'insensitive' } },
              { destination: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.materialTransfer.findMany({
        where, skip, take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          project: { select: { projectName: true } },
          requestedBy: { select: { name: true, role: true } },
          receiver: { select: { name: true } },
        },
      }),
      this.prisma.materialTransfer.count({ where }),
    ]);

    return new PaginatedResult(data, total, page, limit);
  }

  async findOne(id: string) {
    return this.prisma.materialTransfer.findUniqueOrThrow({
      where: { id },
      include: {
        project: true,
        requestedBy: { select: { id: true, name: true, role: true, email: true } },
        receiver: { select: { id: true, name: true, role: true } },
      },
    });
  }

  async create(data: any, userId: string) {
    const count = await this.prisma.materialTransfer.count();
    const transferNumber = `TRF-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    return this.prisma.materialTransfer.create({
      data: {
        transferNumber,
        projectId: data.projectId,
        destination: data.destination,
        materialName: data.materialName,
        quantity: data.quantity,
        requestedById: userId,
        notes: data.notes,
        approvalStatus: 'DRAFT',
      },
      include: { project: true },
    });
  }

  async approve(id: string, userRole: UserRole) {
    if (userRole !== UserRole.SITE_MANAGER && userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only Site Manager can approve transfers');
    }

    const transfer = await this.prisma.materialTransfer.findUniqueOrThrow({ where: { id } });
    if (transfer.approvalStatus !== 'WAITING_APPROVAL') {
      throw new BadRequestException('Transfer is not pending approval');
    }

    return this.prisma.materialTransfer.update({
      where: { id },
      data: { approvalStatus: 'APPROVED' },
    });
  }

  async updateStatus(id: string, status: TransferStatus) {
    return this.prisma.materialTransfer.update({
      where: { id },
      data: { approvalStatus: status },
    });
  }

  async submit(id: string) {
    const transfer = await this.prisma.materialTransfer.findUniqueOrThrow({ where: { id } });
    if (transfer.approvalStatus !== 'DRAFT') {
      throw new BadRequestException('Only DRAFT transfers can be submitted');
    }
    return this.prisma.materialTransfer.update({
      where: { id },
      data: { approvalStatus: 'WAITING_APPROVAL' },
    });
  }
}
