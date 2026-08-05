import { Module } from '@nestjs/common';
import { RfcService } from './rfc.service';
import { RfcController } from './rfc.controller';

@Module({
  controllers: [RfcController],
  providers: [RfcService],
  exports: [RfcService],
})
export class RfcModule {}
