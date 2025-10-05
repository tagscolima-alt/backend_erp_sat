import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CancelarCfdiDto {
  @IsUUID()
  uuid: string;

  @IsString()
  @IsNotEmpty()
  motivo: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}
