import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto) {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = search
      ? {
          OR: [
            { projectName: { contains: search, mode: 'insensitive' } },
            { customer: { contains: search, mode: 'insensitive' } },
            { region: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: { select: { rfcs: true, transfers: true } },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return new PaginatedResult(data, total, page, limit);
  }

  async findOne(id: string) {
    return this.prisma.project.findUniqueOrThrow({
      where: { id },
      include: {
        rfcs: { include: { items: true } },
        transfers: true,
        locations: true,
        _count: { select: { rfcs: true, transfers: true } },
      },
    });
  }

  async create(data: Prisma.ProjectCreateInput) {
    return this.prisma.project.create({ data });
  }

  async update(id: string, data: Prisma.ProjectUpdateInput) {
    return this.prisma.project.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.project.delete({ where: { id } });
  }

  async getStats() {
    const [total, active, completed, planning] = await Promise.all([
      this.prisma.project.count(),
      this.prisma.project.count({ where: { status: 'ACTIVE' } }),
      this.prisma.project.count({ where: { status: 'COMPLETED' } }),
      this.prisma.project.count({ where: { status: 'PLANNING' } }),
    ]);
    return { total, active, completed, planning };
  }
}
