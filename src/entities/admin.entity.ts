import {
  Entity,
  Column,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  ManyToMany,
} from 'typeorm';

import { User } from './user.entity';
import { Place } from './place.entity';
import { Role } from './role.entity';

@Entity()
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.admin)
  user: User;

  @Column({ type: 'char', length: 50 })
  address: string;

  @Column({ type: 'char', length: 20 })
  phone: string;

  @OneToMany(() => Place, (place) => place.admin)
  places: Place[];

  @ManyToMany(() => Role, (role) => role.admins)
  roles: Role[];
}
