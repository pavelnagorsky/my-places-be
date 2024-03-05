import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRequestTypesEnum } from '../enums/user-request-types.enum';
import { CrmStatusesEnum } from '../../shared/enums/crm-statuses.enum';

@Entity()
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: UserRequestTypesEnum.USER })
  userRequestType: UserRequestTypesEnum;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone: string;

  @Column({ type: 'varchar' })
  message: string;

  @Column({ type: 'varchar', length: 100 })
  fullName: string;

  @Column({ default: CrmStatusesEnum.PENDING })
  status: CrmStatusesEnum;

  @CreateDateColumn({
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
