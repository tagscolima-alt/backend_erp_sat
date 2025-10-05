import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  rfc: string;

  @Column()
  certificado: string;

  @Column()
  access_token: string;

  @Column()
  token_type: string;

  @Column()
  expires_in: number;

  @CreateDateColumn()
  creadoEn: Date;
}
