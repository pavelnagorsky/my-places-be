import { Column, PrimaryGeneratedColumn } from 'typeorm';

export abstract class TranslationBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // should be declared in inherited entity
  // @ManyToOne(() => Language, (language) => language.id)
  // language: Language;

  @Column({ type: 'varchar', length: 300, nullable: true })
  text: string;

  @Column({ default: false })
  original: boolean;
}
