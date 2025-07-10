import { Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CityTranslation } from "./city-translation.entity";
import { Excursion } from "../../../entities/excursion.entity";

@Entity()
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => CityTranslation, (translation) => translation.city, {
    cascade: true,
  })
  translations: CityTranslation[];

  @OneToMany(() => Excursion, (excursion) => excursion.city)
  excursions: Excursion[];
}
