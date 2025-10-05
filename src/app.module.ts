import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SatModule } from './sat/sat.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',     // asegúrate que tu Postgres esté corriendo
      port: 5432,
      username: 'postgres',
      password: '123456',
      database: 'erpsat',
      autoLoadEntities: true, // debe estar habilitado
      synchronize: true,      // crea las tablas automáticamente
    }),
    SatModule, // 👈 importante: SatModule después de TypeOrmModule
  ],
})
export class AppModule {}
