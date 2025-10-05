import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class EmitirCfdiDto {
  @IsString()
  @IsNotEmpty()
  rfcEmisor: string;

  @IsString()
  @IsNotEmpty()
  rfcReceptor: string;

  @IsNumber()
  total: number;

  @IsString()
  @IsNotEmpty()
  token: string;
}
