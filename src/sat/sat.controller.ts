import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { SatService } from './sat.service';
import { SolicitarTokenDto } from './dto/solicitar-token.dto';
import { EmitirCfdiDto } from './dto/emitir-cfdi.dto';
import { CancelarCfdiDto } from './dto/cancelar-cfdi.dto';
import { DataSource } from 'typeorm'; // ✅ Importamos el DataSource

@Controller('api/sat/cfdi')
export class SatController {
  constructor(
    private readonly satService: SatService,
    private readonly dataSource: DataSource, // ✅ Inyectamos el DataSource
  ) {}

  // === Endpoints existentes ===
  @Post('token')
  solicitarToken(@Body() body: SolicitarTokenDto) {
    return this.satService.solicitarToken(body);
  }

  @Post('emitir')
  emitirCFDI(@Body() body: EmitirCfdiDto) {
    return this.satService.emitirCFDI(body);
  }

  @Post('cancelar')
  cancelarCFDI(@Body() body: CancelarCfdiDto) {
    return this.satService.cancelarCFDI(body);
  }

  @Get('listar')
  listarCFDIs() {
    return this.satService.listarCFDIs();
  }

  // === Nuevos endpoints ===
  @Get('detalle/:uuid')
  obtenerDetalle(@Param('uuid') uuid: string) {
    return this.satService.obtenerDetalleCFDI(uuid);
  }

  @Get('validar/:uuid')
  validarCFDI(@Param('uuid') uuid: string) {
    return this.satService.validarCFDI(uuid);
  }

  @Get('listar-tokens')
  listarTokens() {
    return this.satService.listarTokens();
  }

  @Post('renovar-token')
  renovarToken(@Body() body: any) {
    return this.satService.renovarToken(body);
  }

  // ✅ === Nuevo endpoint: prueba de conexión a PostgreSQL ===
  @Get('test-db')
  async probarConexionBD() {
    try {
      const result = await this.dataSource.query(
        'SELECT current_database(), current_user, NOW();',
      );
      const fila = result[0];
      return {
        conexion: 'ok',
        baseDatos: fila.current_database,
        usuario: fila.current_user,
        horaServidor: fila.now,
      };
    } catch (error) {
      return {
        conexion: 'error',
        detalle: error.message,
      };
    }
  }
}
