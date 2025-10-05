import { Controller, Post, Body, Get } from '@nestjs/common';
import { SatService } from './sat.service';

@Controller('api/sat')
export class SatController {
  constructor(private readonly satService: SatService) {}

  // 🔴 Solicitar token
  @Post('token/solicitar')
  solicitarToken(@Body() body: any) {
    return this.satService.solicitarToken(body);
  }

  // 🟠 Renovar token
  @Post('token/renovar')
  renovarToken(@Body() body: any) {
    return this.satService.renovarToken(body);
  }

  // 🧾 Emitir CFDI
  @Post('cfdi/emitir')
  emitirCFDI(@Body() body: any) {
    return this.satService.emitirCFDI(body);
  }

  // 🔍 Validar CFDI
  @Post('cfdi/validar')
  validarCFDI(@Body() body: any) {
    return this.satService.validarCFDI(body);
  }

  // ❌ Cancelar CFDI
  @Post('cfdi/cancelar')
  cancelarCFDI(@Body() body: any) {
    return this.satService.cancelarCFDI(body);
  }

  // 🧪 Ruta de prueba
  @Get('ping')
  ping() {
    return { ok: true, message: 'SAT API online ✅' };
  }
}
