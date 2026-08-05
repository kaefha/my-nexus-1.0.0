import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ProjectsModule } from './projects/projects.module';
import { RfcModule } from './rfc/rfc.module';
import { ProcurementModule } from './procurement/procurement.module';
import { LogisticsModule } from './logistics/logistics.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { TransferModule } from './transfer/transfer.module';
import { InventoryModule } from './inventory/inventory.module';
import { MasterDataModule } from './master-data/master-data.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    DashboardModule,
    ProjectsModule,
    RfcModule,
    ProcurementModule,
    LogisticsModule,
    WarehouseModule,
    TransferModule,
    InventoryModule,
    MasterDataModule,
  ],
})
export class AppModule {}
