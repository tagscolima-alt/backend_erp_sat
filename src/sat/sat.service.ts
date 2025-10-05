import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SatService {
  async solicitarToken(body: any) {
    const { rfc, password, certificado } = body;

    return {
      access_token: uuidv4(),
      token_type: 'bearer',
      expires_in: 3600,
      recibido: { rfc, certificado },
    };
  }

  async emitirCFDI(body: any) {
    const { rfcEmisor, rfcReceptor, total, token } = body;

    return {
      uuid: uuidv4(),
      fechaTimbrado: new Date().toISOString(),
      rfcProvCertif: 'AAA010101AAA',
      selloSAT: 'SELLOSAT123ABC',
      estatus: 'Timbrado Correctamente',
      recibido: { rfcEmisor, rfcReceptor, total, token },
    };
  }

  async cancelarCFDI(body: any) {
    const { uuid, motivo, token } = body;

    return {
      uuid,
      fechaCancelacion: new Date().toISOString(),
      estatus: 'Cancelado Correctamente',
      motivo,
      token,
    };
  }
}
