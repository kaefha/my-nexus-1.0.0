import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class MasterDataService {
  constructor(private prisma: PrismaService) {}

  // ===== MATERIALS =====
  async findAllMaterials(query: PaginationDto & { category?: string }) {
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
      this.prisma.materialMaster.findMany({ where, skip, take: limit, orderBy: { materialName: 'asc' } }),
      this.prisma.materialMaster.count({ where }),
    ]);
    return new PaginatedResult(data, total, page, limit);
  }

  async createMaterial(data: any) {
    return this.prisma.materialMaster.create({ data });
  }

  async updateMaterial(id: string, data: any) {
    return this.prisma.materialMaster.update({ where: { id }, data });
  }

  async deleteMaterial(id: string) {
    return this.prisma.materialMaster.delete({ where: { id } });
  }

  // ===== VENDORS =====
  async findAllVendors(query: PaginationDto) {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { vendorName: { contains: search, mode: 'insensitive' as const } },
            { contact: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.vendor.findMany({
        where, skip, take: limit,
        orderBy: { vendorName: 'asc' },
        include: { _count: { select: { purchaseOrders: true } } },
      }),
      this.prisma.vendor.count({ where }),
    ]);
    return new PaginatedResult(data, total, page, limit);
  }

  async createVendor(data: any) {
    return this.prisma.vendor.create({ data });
  }

  async updateVendor(id: string, data: any) {
    return this.prisma.vendor.update({ where: { id }, data });
  }

  async deleteVendor(id: string) {
    return this.prisma.vendor.delete({ where: { id } });
  }

  // ===== USERS =====
  async findAllUsers(query: PaginationDto & { role?: string }) {
    const { page = 1, limit = 20, search, role } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(role ? { role } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where, skip, take: limit,
        orderBy: { name: 'asc' },
        select: {
          id: true, email: true, name: true, role: true,
          phone: true, isActive: true, createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return new PaginatedResult(data, total, page, limit);
  }

  async createUser(data: any) {
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash(data.password || 'password123', 10);
    return this.prisma.user.create({
      data: { ...data, password: hashedPassword },
      select: {
        id: true, email: true, name: true, role: true,
        phone: true, isActive: true, createdAt: true,
      },
    });
  }

  async updateUser(id: string, data: any) {
    if (data.password) {
      const bcrypt = await import('bcrypt');
      data.password = await bcrypt.hash(data.password, 10);
    }
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true, email: true, name: true, role: true,
        phone: true, isActive: true, createdAt: true,
      },
    });
  }

  // ===== UNITS (derived from materials) =====
  async getUnits() {
    const materials = await this.prisma.materialMaster.findMany({
      select: { unit: true },
      distinct: ['unit'],
    });
    return materials.map((m) => m.unit);
  }

  // ===== CATEGORIES =====
  async getCategories() {
    return ['FIBER_OPTIC', 'CABLE', 'JOINT_CLOSURE', 'POLE', 'PIPE', 'ACCESSORIES', 'OTHER'];
  }
}
