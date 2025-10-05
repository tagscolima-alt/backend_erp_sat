import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SatModule } from './sat/sat.module';

@Module({
  imports: [SatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
