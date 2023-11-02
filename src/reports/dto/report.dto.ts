import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Report } from '../entities/report.entity';
import { Place } from '../../places/entities/place.entity';

export class ReportDto {
  constructor(partial: Partial<Report>) {
    Object.assign(this, partial);
  }

  @ApiProperty({ title: 'Id', type: Number })
  id: number;

  @ApiProperty({ title: 'Text', type: String })
  text: string;

  @ApiProperty({ title: 'Created at', type: Date })
  createdAt: Date;

  @ApiProperty({ title: 'Place slug', type: String })
  @Expose()
  get placeSlug(): string | null {
    return this.place?.slug || null;
  }

  @Exclude()
  place: Partial<Place>;
}
