import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Admin } from './admin.entity';
import { Translation } from '../translations/entities/translation.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Translation, (translation) => translation.textId)
  @JoinColumn()
  name: Translation;

  @ManyToMany(() => Admin, (admin) => admin.roles)
  @JoinTable()
  admins: Admin[];
}
