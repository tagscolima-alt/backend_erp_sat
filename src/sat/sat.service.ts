import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Cfdi } from './entities/cfdi.entity';
import { Token } from './entities/token.entity';

@Injectable()
export class SatService {
  constructor(
    @InjectRepository(Cfdi) private cfdiRepo: Repository<Cfdi>,
    @InjectRepository(Token) private tokenRepo: Repository<Token>,
    private readonly dataSource: DataSource, // ✅ Inyectamos conexión directa a BD
  ) {}

  // 🧾 ========================================================
  //                    MÉTODOS EXISTENTES
  // ==========================================================

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

    // 🪵 Registrar log
    await this.registrarLog('SAT', 'solicitarToken', body);

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

    // 🪵 Registrar log
    await this.registrarLog('SAT', 'emitirCFDI', body);

    return {
      uuid: cfdi.uuid,
      fechaTimbrado: cfdi.fechaTimbrado,
      rfcProvCertif: 'AAA010101AAA',
      selloSAT: cfdi.selloSAT,
      estatus: cfdi.estatus,
      recibido: body,
    };
  }

// 🧾 Cancelar un CFDI existente
async cancelarCFDI(body: any) {
  const { uuid, motivo, token } = body;
  const cfdi = await this.cfdiRepo.findOne({ where: { uuid } });

  if (!cfdi) {
    throw new NotFoundException(`CFDI con UUID ${uuid} no encontrado`);
  }

  cfdi.estatus = 'Cancelado Correctamente';
  await this.cfdiRepo.save(cfdi);

  // Registrar log de cancelación
  await this.cfdiRepo.query(
    `INSERT INTO logs_sistema (origen, accion, detalles, ip_cliente)
     VALUES ($1, $2, $3, $4)`,
    [
      'SAT',
      'cancelarCFDI',
      JSON.stringify({
        uuid,
        motivo,
        token,
        fechaCancelacion: new Date().toISOString(),
      }),
      '::1', // localhost
    ],
  );

  return {
    uuid,
    fechaCancelacion: new Date(),
    estatus: cfdi.estatus,
    motivo,
    token,
  };
}

  async listarCFDIs() {
    const lista = await this.cfdiRepo.find({
      order: { fechaTimbrado: 'DESC' },
    });

    // 🪵 Registrar log de consulta
    await this.registrarLog('SAT', 'listarCFDIs', { total: lista.length });

    return lista;
  }

  // ==========================================================
  //                      NUEVOS MÉTODOS
  // ==========================================================

  async obtenerDetalleCFDI(uuid: string) {
    const cfdi = await this.cfdiRepo.findOne({ where: { uuid } });
    if (!cfdi)
      throw new NotFoundException(`CFDI con UUID ${uuid} no encontrado`);

    await this.registrarLog('SAT', 'obtenerDetalleCFDI', { uuid });

    return cfdi;
  }

  async validarCFDI(uuid: string) {
    const cfdi = await this.cfdiRepo.findOne({ where: { uuid } });
    const resultado = cfdi
      ? { uuid, valido: true, estatus: cfdi.estatus }
      : { uuid, valido: false, mensaje: 'CFDI no encontrado' };

    await this.registrarLog('SAT', 'validarCFDI', resultado);

    return resultado;
  }

  async listarTokens() {
    const tokens = await this.tokenRepo.find({
      order: { creadoEn: 'DESC' },
    });

    await this.registrarLog('SAT', 'listarTokens', { total: tokens.length });

    return tokens;
  }

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

    await this.registrarLog('SAT', 'renovarToken', { old_token });

    return {
      mensaje: 'Token renovado correctamente',
      nuevo_token: nuevoToken.access_token,
      anterior: old_token,
    };
  }

  /// ==========================================================
  //                     SISTEMA DE LOGS (MEJORADO)
  // ==========================================================

  async registrarLog(
    origen: string,
    accion: string,
    detalles: any,
    ip_cliente = 'localhost',
    metodo_http = '',
    endpoint = '',
  ) {
    try {
      const accionCompleta = metodo_http && endpoint
        ? `${metodo_http.toUpperCase()} ${endpoint}`
        : accion;

      await this.dataSource.query(
        `INSERT INTO logs_sistema (origen, accion, detalles, ip_cliente)
         VALUES ($1, $2, $3, $4)`,
        [origen, accionCompleta, JSON.stringify(detalles), ip_cliente],
      );

      console.log(`🗂 Log registrado: [${origen}] ${accionCompleta}`);
    } catch (error) {
      console.warn('⚠️ Error al registrar log:', error.message);
    }
  }
  }