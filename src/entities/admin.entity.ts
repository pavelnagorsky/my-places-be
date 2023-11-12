import { Entity, Column, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '../users/entities/user.entity';

@Entity()
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.admin)
  user: User;

  @Column({ type: 'varchar', length: 50 })
  address: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;
}
