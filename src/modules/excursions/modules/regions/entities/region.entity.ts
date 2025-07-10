import { Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { RegionTranslation } from "./region-translation.entity";
import { Excursion } from "../../../entities/excursion.entity";

@Entity()
export class Region {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => RegionTranslation, (translation) => translation.region, {
    cascade: true,
  })
  translations: RegionTranslation[];

  @OneToMany(() => Excursion, (excursion) => excursion.region)
  excursions: Excursion[];
}
