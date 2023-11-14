import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Language } from '../../languages/entities/language.entity';

@Entity()
export class Translation {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'int' })
  textId: number;

  @ManyToOne(() => Language, (language) => language.id)
  language: Language;

  @Column({ type: 'varchar', length: 3000 })
  text: string;

  @Column({ default: false })
  original: boolean;
}
