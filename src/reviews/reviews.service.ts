import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ImagesService } from '../images/images.service';
import { TranslationsService } from '../translations/translations.service';
import { Review } from './entities/review.entity';
import { User } from '../users/entities/user.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Place } from '../places/entities/place.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(Place)
    private placesRepository: Repository<Place>,
    private imagesService: ImagesService,
    private translationsService: TranslationsService,
  ) {}

  private async createTranslations(
    langId: number,
    dto: CreateReviewDto | UpdateReviewDto,
    translateAll = true,
  ) {
    const titleTranslation = await this.translationsService.createTranslation(
      langId,
      dto.title,
      true,
    );

    const descriptionTranslation =
      await this.translationsService.createTranslation(
        langId,
        dto.description,
        true,
      );

    if (!titleTranslation || !descriptionTranslation)
      throw new BadRequestException({ message: 'Invalid text data' });

    if (translateAll) {
      await this.translationsService.translateAll(
        titleTranslation.text,
        titleTranslation.textId,
        langId,
      );
      await this.translationsService.translateAll(
        descriptionTranslation.text,
        descriptionTranslation.textId,
        langId,
      );
    }

    return {
      titleTranslation,
      descriptionTranslation,
    };
  }

  private selectPlacesQuery(
    qb: SelectQueryBuilder<Review>,
    langId: number,
  ): SelectQueryBuilder<Review> {
    return qb
      .leftJoinAndSelect('review.images', 'image')
      .addOrderBy('image.position')
      .leftJoinAndMapOne(
        'review.description',
        'translation',
        'description_t',
        'review.description = description_t.textId AND description_t.language = :langId',
        { langId },
      )
      .leftJoinAndMapOne(
        'review.title',
        'translation',
        'title_t',
        'review.title = title_t.textId AND title_t.language = :langId',
        { langId },
      );
  }

  // create review
  async create(createReviewDto: CreateReviewDto, langId: number, user: User) {
    const place = await this.placesRepository.findOne({
      where: {
        id: createReviewDto.placeId,
      },
      select: ['id'],
    });

    if (!place) throw new BadRequestException({ message: 'Place not exists' });

    const reviewImages = await this.imagesService.updatePositions(
      createReviewDto.imagesIds,
    );
    const translations = await this.createTranslations(langId, createReviewDto);
    const review = this.reviewsRepository.create();
    review.title = translations.titleTranslation.textId;
    review.description = translations.descriptionTranslation.textId;
    review.images = reviewImages;
    review.author = user;
    review.place = place;
    const { id } = await this.reviewsRepository.save(review);
    return { id: id };
  }

  async findAll(langId: number) {
    const qb = this.reviewsRepository.createQueryBuilder('review');
    return this.selectPlacesQuery(qb, langId).getMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} review`;
  }

  update(id: number, updateReviewDto: UpdateReviewDto) {
    return `This action updates a #${id} review`;
  }

  remove(id: number) {
    return `This action removes a #${id} review`;
  }
}
