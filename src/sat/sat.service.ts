import { Injectable, NotFoundException } from '@nestjs/common';
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

  // ========================
  //   MÉTODOS EXISTENTES
  // ========================

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
      throw new NotFoundException(`CFDI con UUID ${uuid} no encontrado`);
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

  async listarCFDIs() {
    return this.cfdiRepo.find({
      order: { fechaTimbrado: 'DESC' },
    });
  }

  // ========================
  //   NUEVOS MÉTODOS
  // ========================

  // 📄 1️⃣ Obtener detalle de un CFDI
  async obtenerDetalleCFDI(uuid: string) {
    const cfdi = await this.cfdiRepo.findOne({ where: { uuid } });
    if (!cfdi) throw new NotFoundException(`CFDI con UUID ${uuid} no encontrado`);
    return cfdi;
  }

  // 🔍 2️⃣ Validar si existe un CFDI
  async validarCFDI(uuid: string) {
    const cfdi = await this.cfdiRepo.findOne({ where: { uuid } });
    if (!cfdi) {
      return { uuid, valido: false, mensaje: 'CFDI no encontrado' };
    }
    return { uuid, valido: true, estatus: cfdi.estatus };
  }

  // 🧾 3️⃣ Listar todos los tokens emitidos
  async listarTokens() {
    return this.tokenRepo.find({
      order: { creadoEn: 'DESC' },
    });
  }

  // ♻️ 4️⃣ Renovar un token existente
  async renovarToken(body: any) {
    const { old_token } = body;
    const tokenExistente = await this.tokenRepo.findOne({
      where: { access_token: old_token },
    });

    if (!tokenExistente) {
      throw new NotFoundException(`Token anterior no encontrado`);
    }

    const nuevoToken = this.tokenRepo.create({
      rfc: tokenExistente.rfc,
      certificado: tokenExistente.certificado,
      access_token: uuidv4(),
      token_type: 'bearer',
      expires_in: 3600,
    });

    await this.tokenRepo.save(nuevoToken);

    return {
      mensaje: 'Token renovado correctamente',
      nuevo_token: nuevoToken.access_token,
      anterior: old_token,
    };
  }
}
