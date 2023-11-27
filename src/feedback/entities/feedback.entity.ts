import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserRequestTypesEnum } from '../enums/user-request-types.enum';
import { CrmStatusesEnum } from '../../shared/enums/crm-statuses.enum';

@Entity()
export class FeedbackEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: UserRequestTypesEnum.USER })
  userRequestType: UserRequestTypesEnum;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 30 })
  phone: string;

  @Column({ type: 'varchar' })
  message: string;

  @Column({ type: 'varchar', length: 100 })
  fullName: string;

  @Column({ default: CrmStatusesEnum.PENDING })
  status: CrmStatusesEnum;
}
