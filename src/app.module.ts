import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SatModule } from './sat/sat.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123456',
      database: 'erpsat',
      autoLoadEntities: true,
      synchronize: true,
    }),
    SatModule,
  ],
})
export class AppModule {}
