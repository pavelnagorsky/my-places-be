import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Place } from "../../places/entities/place.entity";
import { CrmStatusesEnum } from "../../../shared/enums/crm-statuses.enum";
import { User } from "../../users/entities/user.entity";
import { Excursion } from "../../excursions/entities/excursion.entity";
import { StatisticEntitiesEnum } from "../enums/statistic-entities.enum";

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 1000 })
  text: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Place, (place) => place.reports, {
    onDelete: "CASCADE",
    nullable: true,
  })
  place: Place;

  @Column({ type: "tinyint", default: StatisticEntitiesEnum.Place })
  entityType: StatisticEntitiesEnum;

  @ManyToOne(() => Excursion, (excursion) => excursion.reports, {
    onDelete: "CASCADE",
    nullable: true,
  })
  excursion: Excursion;

  @Column({ default: CrmStatusesEnum.PENDING })
  status: CrmStatusesEnum;

  @ManyToOne(() => User, (user) => user.reportsModeration)
  moderator: User;
}
