import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Place } from "../../../entities/place.entity";
import { User } from "../../../../users/entities/user.entity";

@Entity()
export class Favourite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  actual: boolean;

  @ManyToOne(() => Place, (place) => place.favourites, { onDelete: "CASCADE" })
  place: Place;

  @ManyToOne(() => User, (user) => user.favourites, { onDelete: "CASCADE" })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
