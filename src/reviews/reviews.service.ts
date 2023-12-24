import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ImagesService } from '../images/images.service';
import { TranslationsService } from '../translations/translations.service';
import { Review } from './entities/review.entity';
import { User } from '../users/entities/user.entity';
import {
  Between,
  Equal,
  FindManyOptions,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Place } from '../places/entities/place.entity';
import { ReviewTranslation } from './entities/review-translation.entity';
import { TokenPayloadDto } from '../auth/dto/token-payload.dto';
import { MyReviewsRequestDto } from './dto/my-reviews-request.dto';
import { MyReviewsOrderByEnum } from './enums/my-reviews-order-by.enum';

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
    const [reviews, totalCount] = await this.reviewsRepository.findAndCount({
      relations: {
        translations: true,
        author: true,
      },
      select: {
        id: true,
        createdAt: true,
        translations: {
          title: true,
          description: true,
        },
        author: {
          firstName: true,
          lastName: true,
        },
      },
      where: {
        place: { id: placeId },
        translations: {
          language: {
            id: langId,
          },
        },
      },
      order: {
        createdAt: 'DESC',
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

  private async addView(reviewId: number) {
    return this.reviewsRepository
      .createQueryBuilder()
      .update()
      .set({ viewsCount: () => 'viewsCount + 1' })
      .where({ id: Equal(reviewId) })
      .execute();
  }

  async findOne(id: number, langId: number) {
    const review = await this.reviewsRepository.findOne({
      relations: {
        images: true,
        translations: true,
        author: true,
      },
      select: {
        id: true,
        createdAt: true,
        translations: {
          title: true,
          description: true,
        },
        author: {
          firstName: true,
          lastName: true,
        },
        images: true,
      },
      where: {
        id: id,
        translations: {
          language: {
            id: langId,
          },
        },
      },
      order: {
        images: {
          position: 'ASC',
        },
      },
    });
    if (!review)
      throw new NotFoundException({ message: 'Review was not found' });
    this.addView(id);
    return review;
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

  async findMyReviews(
    langId: number,
    dto: MyReviewsRequestDto,
    tokenPayload: TokenPayloadDto,
  ) {
    const orderDirection = dto.orderAsc ? 'ASC' : 'DESC';

    const getDateWhereOption = () => {
      if (!!dto.dateFrom && !!dto.dateTo)
        return Between(new Date(dto.dateFrom), new Date(dto.dateTo));
      if (!!dto.dateFrom) return MoreThanOrEqual(new Date(dto.dateFrom));
      if (!!dto.dateTo) return LessThanOrEqual(new Date(dto.dateTo));
      return undefined;
    };

    const res = await this.reviewsRepository.findAndCount({
      relations: {
        translations: true,
        place: { translations: true },
      },
      skip: dto.lastIndex,
      take: dto.itemsPerPage,
      order: {
        createdAt:
          dto.orderBy === MyReviewsOrderByEnum.CREATED_AT || !dto.orderBy
            ? orderDirection
            : undefined,
        translations: {
          title:
            dto.orderBy === MyReviewsOrderByEnum.TITLE
              ? orderDirection
              : undefined,
        },
        place: {
          translations: {
            title:
              dto.orderBy === MyReviewsOrderByEnum.PLACE_TITLE
                ? orderDirection
                : undefined,
          },
        },
        status:
          dto.orderBy === MyReviewsOrderByEnum.STATUS
            ? orderDirection
            : undefined,
        viewsCount:
          dto.orderBy === MyReviewsOrderByEnum.VIEWS
            ? orderDirection
            : undefined,
      },
      select: {
        id: true,
        translations: {
          title: true,
        },
        place: {
          id: true,
          slug: true,
          translations: {
            title: true,
          },
        },
        moderationMessage: true,
        viewsCount: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        author: {
          id: tokenPayload.id,
        },
        place: {
          translations: {
            language: {
              id: langId,
            },
          },
        },
        createdAt: getDateWhereOption(),
        status:
          !!dto.statuses && dto.statuses?.length > 0
            ? In(dto.statuses)
            : undefined,
        translations: {
          title:
            !!dto.search && dto.search.length > 0
              ? ILike(`${dto.search}%`)
              : undefined,
          language: {
            id: langId,
          },
        },
      },
    });

    return res;
  }
}
