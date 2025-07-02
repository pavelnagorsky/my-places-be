import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from "typeorm";
import { Place } from "../../../entities/place.entity";
import { User } from "../../../../users/entities/user.entity";

@Entity()
export class PlaceComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 1000 })
  text: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.comments)
  user: User;

  @ManyToOne(() => Place, (place) => place.comments, { onDelete: "CASCADE" })
  place: Place;
}
