import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { Report } from "../entities/report.entity";
import { Place } from "../../places/entities/place.entity";
import { CrmStatusesEnum } from "../../../shared/enums/crm-statuses.enum";
import { Excursion } from "../../excursions/entities/excursion.entity";
import { StatisticEntitiesEnum } from "../enums/statistic-entities.enum";

export class ReportDto {
  constructor(partial: Partial<Report>) {
    Object.assign(this, partial);
  }

  @ApiProperty({ title: "Id", type: Number })
  id: number;

  @ApiProperty({ title: "Text", type: String })
  text: string;

  @ApiProperty({ title: "Created at", type: Date })
  createdAt: Date;

  @ApiProperty({ title: "status", enum: CrmStatusesEnum })
  status: CrmStatusesEnum;

  @ApiProperty({ title: "Entity slug", type: String, nullable: true })
  @Expose()
  get entitySlug(): string | null {
    return this.place?.slug || this.excursion?.slug || null;
  }

  @ApiProperty({ title: "Entity id", type: Number })
  @Expose()
  get entityId(): number {
    return this.place?.id || (this?.excursion?.id as number);
  }

  @ApiProperty({ title: "Entity type", enum: StatisticEntitiesEnum })
  entityType: StatisticEntitiesEnum;

  @Exclude()
  place: Place | null;

  @Exclude()
  excursion: Excursion | null;
}
