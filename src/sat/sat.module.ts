import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SatController } from './sat.controller';
import { SatService } from './sat.service';
import { Cfdi } from './entities/cfdi.entity';
import { Token } from './entities/token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cfdi, Token])],
  controllers: [SatController],
  providers: [SatService],
})
export class SatModule {}
