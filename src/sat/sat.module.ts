import { Module } from '@nestjs/common';
import { SatController } from './sat.controller';
import { SatService } from './sat.service';

@Module({
  controllers: [SatController],
  providers: [SatService],
})
export class SatModule {}
