import { Entity, PrimaryGeneratedColumn, ManyToMany, Column } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { RoleNamesEnum } from '../enums/role-names.enum';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: false,
  })
  name: RoleNamesEnum;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
