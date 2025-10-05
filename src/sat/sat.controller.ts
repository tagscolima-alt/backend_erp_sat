import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { SatService } from './sat.service';
import { SolicitarTokenDto } from './dto/solicitar-token.dto';
import { EmitirCfdiDto } from './dto/emitir-cfdi.dto';
import { CancelarCfdiDto } from './dto/cancelar-cfdi.dto';
import { RegistrarLog } from '../common/decorators/registrar-log.decorator';

@Controller('api/sat/cfdi')
export class SatController {
  constructor(private readonly satService: SatService) {}

  @RegistrarLog('SAT')
  @Post('token')
  solicitarToken(@Body() body: SolicitarTokenDto) {
    return this.satService.solicitarToken(body);
  }

  @RegistrarLog('SAT')
  @Post('emitir')
  emitirCFDI(@Body() body: EmitirCfdiDto) {
    return this.satService.emitirCFDI(body);
  }

  @RegistrarLog('SAT')
  @Post('cancelar')
  cancelarCFDI(@Body() body: CancelarCfdiDto) {
    return this.satService.cancelarCFDI(body);
  }

  @RegistrarLog('SAT')
  @Get('listar')
  listarCFDIs() {
    return this.satService.listarCFDIs();
  }
}
