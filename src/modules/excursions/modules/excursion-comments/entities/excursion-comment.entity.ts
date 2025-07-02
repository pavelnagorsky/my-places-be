import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from "typeorm";
import { User } from "../../../../users/entities/user.entity";
import { Excursion } from "../../../entities/excursion.entity";
import { StatisticEntitiesEnum } from "../../../../reports/enums/statistic-entities.enum";

@Entity()
export class ExcursionComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 1000 })
  text: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.comments)
  user: User;

  @ManyToOne(() => Excursion, (excursion) => excursion.comments, {
    onDelete: "CASCADE",
  })
  excursion: Excursion;
}
