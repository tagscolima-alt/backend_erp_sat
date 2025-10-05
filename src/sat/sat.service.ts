import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Cfdi } from './entities/cfdi.entity';
import { Token } from './entities/token.entity';

@Injectable()
export class SatService {
  constructor(
    @InjectRepository(Cfdi) private cfdiRepo: Repository<Cfdi>,
    @InjectRepository(Token) private tokenRepo: Repository<Token>,
  ) {}

  async solicitarToken(body: any) {
    const { rfc, password, certificado } = body;

    const token = this.tokenRepo.create({
      rfc,
      certificado,
      access_token: uuidv4(),
      token_type: 'bearer',
      expires_in: 3600,
    });

    await this.tokenRepo.save(token);

    return {
      access_token: token.access_token,
      token_type: token.token_type,
      expires_in: token.expires_in,
      recibido: { rfc, certificado },
    };
  }

  async emitirCFDI(body: any) {
    const { rfcEmisor, rfcReceptor, total, token } = body;

    const cfdi = this.cfdiRepo.create({
      uuid: uuidv4(),
      rfcEmisor,
      rfcReceptor,
      total,
      selloSAT: 'SELLOSAT123ABC',
      estatus: 'Timbrado Correctamente',
    });

    await this.cfdiRepo.save(cfdi);

    return {
      uuid: cfdi.uuid,
      fechaTimbrado: cfdi.fechaTimbrado,
      rfcProvCertif: 'AAA010101AAA',
      selloSAT: cfdi.selloSAT,
      estatus: cfdi.estatus,
      recibido: body,
    };
  }

  async cancelarCFDI(body: any) {
    const { uuid, motivo, token } = body;
    const cfdi = await this.cfdiRepo.findOne({ where: { uuid } });

    if (!cfdi) {
      return { error: `CFDI con UUID ${uuid} no encontrado` };
    }

    cfdi.estatus = 'Cancelado Correctamente';
    await this.cfdiRepo.save(cfdi);

    return {
      uuid,
      fechaCancelacion: new Date(),
      estatus: cfdi.estatus,
      motivo,
      token,
    };
  }

  // Nuevo endpoint para listar CFDIs
  async listarCFDIs() {
    return this.cfdiRepo.find({
      order: { fechaTimbrado: 'DESC' },
    });
  }
}
