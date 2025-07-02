import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Place } from "../../../entities/place.entity";
import { User } from "../../../../users/entities/user.entity";

@Entity()
export class PlaceLike {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.likes)
  user: User;

  @ManyToOne(() => Place, (place) => place.likes, { onDelete: "CASCADE" })
  place: Place;
}
