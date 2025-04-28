import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { ExcursionTranslation } from '../entities/excursion-translation.entity';
import { ExcursionPlace } from '../entities/excursion-place.entity';
import { ExcursionTypesEnum } from '../enums/excursion-types.enum';
import { Excursion } from '../entities/excursion.entity';
import { ExcursionsModerationListItemPlaceDto } from './excursions-moderation-list-item-place.dto';
import { User } from '../../users/entities/user.entity';

export class ExcursionsModerationListItemDto {
  @ApiProperty({ title: 'Excursion id', type: Number })
  id: number;

  @ApiProperty({ type: String, description: 'Excursion url path' })
  slug: string;

  @ApiProperty({ type: String, description: 'Excursion title' })
  @Expose()
  get title(): string {
    return this.translations[0]?.title || '';
  }

  @Exclude()
  translations: ExcursionTranslation[];

  @ApiProperty({
    type: ExcursionsModerationListItemPlaceDto,
    isArray: true,
    description: 'Excursion places',
  })
  places: ExcursionsModerationListItemPlaceDto[];

  @Exclude()
  excursionPlaces: ExcursionPlace[];

  @ApiProperty({
    type: Date,
    description: 'created at',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'updated at',
  })
  updatedAt: Date;

  @ApiProperty({
    enum: ExcursionTypesEnum,
    description: 'Excursion type',
  })
  type: ExcursionTypesEnum;

  @Exclude()
  author: User;

  @ApiProperty({ type: String, description: 'Author username' })
  @Expose()
  get authorName(): string {
    return `${this.author.firstName} ${this.author.lastName}`;
  }

  @ApiProperty({ type: String, description: 'Author email' })
  @Expose()
  get authorEmail(): string {
    return this.author.email;
  }

  constructor(partial: Partial<Excursion>) {
    Object.assign(this, partial);
    const excursionPlaces = partial.excursionPlaces ?? [];
    excursionPlaces.sort((a, b) => a.position - b.position);
    this.places = excursionPlaces.map(
      (excursionPlace) =>
        new ExcursionsModerationListItemPlaceDto(excursionPlace),
    );
  }
}
