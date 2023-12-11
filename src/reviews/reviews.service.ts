import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ImagesService } from '../images/images.service';
import { TranslationsService } from '../translations/translations.service';
import { Review } from './entities/review.entity';
import { User } from '../users/entities/user.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { Place } from '../places/entities/place.entity';
import { ITranslation } from '../translations/interfaces/translation.interface';
import { ReviewTranslation } from './entities/review-translation.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(Place)
    private placesRepository: Repository<Place>,
    @InjectRepository(ReviewTranslation)
    private reviewTranslationsRepository: Repository<ReviewTranslation>,
    private imagesService: ImagesService,
    private translationsService: TranslationsService,
  ) {}

  // create translations for review
  private async createTranslations(sourceLangId: number, dto: CreateReviewDto) {
    const allLanguages = await this.translationsService.getAllLanguages();

    const translations: ReviewTranslation[] = [];

    await Promise.all(
      allLanguages.map(async (lang) => {
        // translate titles
        const newTranslation = this.reviewTranslationsRepository.create({
          language: {
            id: lang.id,
          },
          title:
            lang.id === sourceLangId
              ? dto.title
              : await this.translationsService.createGoogleTranslation(
                  dto.title,
                  lang.code,
                  sourceLangId,
                ),
          description:
            lang.id === sourceLangId
              ? dto.description
              : await this.translationsService.createGoogleTranslation(
                  dto.description,
                  lang.code,
                  sourceLangId,
                ),
          original: lang.id === sourceLangId,
        });
        translations.push(newTranslation);
        return;
      }),
    );

    return translations;
  }

  // update review translations
  private async updateTranslations(
    sourceLangId: number,
    review: Review,
    dto: UpdateReviewDto,
    translateAll: boolean,
  ) {
    const translations: ReviewTranslation[] = [];

    // helper function to merge update translations
    const mergeUpdateTranslations = async (
      arrayToSave: ReviewTranslation[],
      translation: ReviewTranslation,
    ) => {
      const newTranslation = this.reviewTranslationsRepository.create({
        id: translation.id,
        language: {
          id: translation.language.id,
        },
        // update if this language was selected in request
        // translate if translateAll option was selected
        // else do not change
        title:
          translation.language.id === sourceLangId
            ? dto.title
            : translateAll
            ? await this.translationsService.createGoogleTranslation(
                dto.title,
                translation.language.code,
                sourceLangId,
              )
            : translation.title,
        description:
          translation.language.id === sourceLangId
            ? dto.description
            : translateAll
            ? await this.translationsService.createGoogleTranslation(
                dto.description,
                translation.language.code,
                sourceLangId,
              )
            : translation.description,
        original: translation.language.id === sourceLangId,
      });
      arrayToSave.push(newTranslation);
      return;
    };

    const updateTranslations = review.translations.map(async (translation) => {
      // translate review
      await mergeUpdateTranslations(translations, translation);
      return;
    });

    await Promise.all(updateTranslations);

    return translations;
  }

  private getReviewFindOptions(langId: number): FindManyOptions<Review> {
    return {
      relations: {
        images: true,
        translations: true,
        author: true,
      },
      where: {
        translations: {
          language: {
            id: langId,
          },
        },
      },
      order: {
        createdAt: 'DESC',
        images: {
          position: 'ASC',
        },
      },
    };
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
    review.translations = translations;
    review.images = reviewImages;
    review.author = user;
    review.place = place;
    const { id } = await this.reviewsRepository.save(review);
    return { id: id };
  }

  async findAllByPlaceId(
    placeId: number,
    langId: number,
    itemsPerPage: number,
    lastIndex: number,
  ) {
    const defaultFindOptions = this.getReviewFindOptions(langId);
    const [reviews, totalCount] = await this.reviewsRepository.findAndCount({
      ...defaultFindOptions,
      where: {
        ...defaultFindOptions.where,
        place: { id: placeId },
      },
      skip: lastIndex,
      take: itemsPerPage,
    });
    const hasMore = totalCount > reviews.length + lastIndex;
    return {
      hasMore,
      reviews,
      totalCount,
    };
  }

  async findOne(id: number, langId: number) {
    const defaultFindOptions = this.getReviewFindOptions(langId);
    return await this.reviewsRepository.findOne({
      ...defaultFindOptions,
      where: {
        ...defaultFindOptions.where,
        id: id,
      },
    });
  }

  update(id: number, updateReviewDto: UpdateReviewDto) {
    return `This action updates a #${id} review`;
  }

  async removeReview(id: number) {
    const deleted = await this.reviewsRepository.remove(
      this.reviewsRepository.create({ id }),
    );
    return { id };
  }
}
