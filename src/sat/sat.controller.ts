import { Controller, Post, Body } from '@nestjs/common';
import { SatService } from './sat.service';

@Controller('api/sat/cfdi')
export class SatController {
  constructor(private readonly satService: SatService) {}

  // Solicitar token
  @Post('token')
  solicitarToken(@Body() body: any) {
    return this.satService.solicitarToken(body);
  }

  // Emitir CFDI
  @Post('emitir')
  emitirCFDI(@Body() body: any) {
    return this.satService.emitirCFDI(body);
  }

  // Cancelar CFDI
  @Post('cancelar')
  cancelarCFDI(@Body() body: any) {
    return this.satService.cancelarCFDI(body);
  }
}

