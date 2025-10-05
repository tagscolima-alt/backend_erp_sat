import { IsString, IsNotEmpty } from 'class-validator';

export class SolicitarTokenDto {
  @IsString()
  @IsNotEmpty()
  rfc: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  certificado: string;
}
