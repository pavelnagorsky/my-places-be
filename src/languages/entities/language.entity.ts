import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Translation } from '../../translations/entities/translation.entity';

@Entity()
export class Language {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 25 })
  title: string;

  @Column({ type: 'varchar', length: 10 })
  code: string;

  @OneToMany(() => Translation, (translation) => translation.language)
  translation: Translation;
}
