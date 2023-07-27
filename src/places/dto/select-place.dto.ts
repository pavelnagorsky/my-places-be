import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Translation } from '../../translations/entities/translation.entity';
import { Place } from '../entities/place.entity';

export class SelectPlaceDto {
  @ApiProperty({ title: 'Place id', type: Number })
  id: number;

  @ApiProperty({ type: String, description: 'Place title' })
  @Transform(
    ({ value }: { value: Partial<Translation> }) => value?.text ?? null,
  )
  title: string;

  constructor(partial: Partial<Place>) {
    Object.assign(this, partial);
  }
}
