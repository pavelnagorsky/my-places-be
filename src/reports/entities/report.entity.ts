import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Place } from '../../places/entities/place.entity';
import { CrmStatusesEnum } from '../../shared/enums/crm-statuses.enum';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 1000 })
  text: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Place, (place) => place.reports)
  place: Place;

  @Column({ default: CrmStatusesEnum.PENDING })
  status: CrmStatusesEnum;

  @ManyToOne(() => User, (user) => user.reportsModeration)
  moderator: User;
}
