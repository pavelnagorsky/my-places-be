import { Entity, Column, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from './user.entity';

@Entity()
export class Moderator {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.moderator)
  user: User;

  @Column({ type: 'varchar', length: 50, nullable: true, default: null })
  address: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true, default: null })
  phone: string | null;
}
