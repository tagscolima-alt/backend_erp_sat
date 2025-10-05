import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Cfdi {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  uuid: string;

  @Column()
  rfcEmisor: string;

  @Column()
  rfcReceptor: string;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column()
  estatus: string;

  @Column()
  selloSAT: string;

  @CreateDateColumn()
  fechaTimbrado: Date;
}
