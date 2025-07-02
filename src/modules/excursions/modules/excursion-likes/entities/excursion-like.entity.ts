import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../../../users/entities/user.entity";
import { Excursion } from "../../../entities/excursion.entity";

@Entity()
export class ExcursionLike {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.likes)
  user: User;

  @ManyToOne(() => Excursion, (excursion) => excursion.likes, {
    onDelete: "CASCADE",
  })
  excursion: Excursion;
}
