import {
  Entity,
  Column,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  ManyToMany,
} from 'typeorm';

import { User } from '../users/entities/user.entity';
import { Place } from '../places/entities/place.entity';
import { Role } from '../roles/entities/role.entity';

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

  @OneToMany(() => Place, (place) => place.admin)
  places: Place[];
}
