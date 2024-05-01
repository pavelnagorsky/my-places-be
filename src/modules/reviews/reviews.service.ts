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
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Place } from '../places/entities/place.entity';
import { ReviewTranslation } from './entities/review-translation.entity';
import { AccessTokenPayloadDto } from '../auth/dto/access-token-payload.dto';
import { MyReviewsRequestDto } from './dto/my-reviews-request.dto';
import { MyReviewsOrderByEnum } from './enums/my-reviews-order-by.enum';
import { ReviewStatusesEnum } from './enums/review-statuses.enum';
import { ModerationReviewsRequestDto } from './dto/moderation-reviews-request.dto';
import { ModerationReviewsOrderByEnum } from './enums/moderation-reviews-order-by';
import { ModerationDto } from '../places/dto/moderation.dto';
import { AdministrationReviewsRequestDto } from './dto/administration-reviews-request.dto';
import { LanguageIdEnum } from '../languages/enums/language-id.enum';
import { ReviewEmail } from '../mailing/emails/review.email';
import { ReviewForEmailDto } from './dto/review-for-email.dto';
import { MailingService } from '../mailing/mailing.service';

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
    private mailingService: MailingService,
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
    review.status = ReviewStatusesEnum.MODERATION;
    const { id } = await this.reviewsRepository.save(review);
    return { id: id };
  }

  async findAllByPlaceSlug(
    placeSlug: string,
    langId: number,
    pageSize: number,
    page: number,
    statusFilter?: ReviewStatusesEnum,
  ) {
    const result = await this.reviewsRepository.findAndCount({
      skip: page * pageSize,
      take: pageSize,
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
        place: { slug: Equal(placeSlug) },
        status: statusFilter,
        translations: {
          language: {
            id: langId,
          },
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
    return result;
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
        status: ReviewStatusesEnum.APPROVED,
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

  async update(
    reviewId: number,
    langId: number,
    updateReviewDto: UpdateReviewDto,
    byAdmin = false,
  ) {
    try {
      const oldReview = await this.reviewsRepository.findOne({
        relations: {
          translations: {
            language: true,
          },
        },
        where: {
          id: reviewId,
        },
      });
      if (!oldReview)
        throw new BadRequestException({ message: 'Review not exists' });

      const reviewImages = await this.imagesService.updatePositions(
        updateReviewDto.imagesIds,
      );

      const translations = await this.updateTranslations(
        langId,
        oldReview,
        updateReviewDto,
        updateReviewDto.shouldTranslate,
      );

      const updatedReview = this.reviewsRepository.create({
        id: reviewId,
        images: reviewImages,
        translations: translations,
      });
      if (!byAdmin) {
        updatedReview.status = ReviewStatusesEnum.MODERATION;
        updatedReview.moderationMessage = null;
      }

      await this.reviewsRepository.save(updatedReview);

      return { id: reviewId };
    } catch (e) {
      if (e instanceof BadRequestException) {
        throw e;
      }
      throw new BadRequestException({ message: 'Incorrect details' });
    }
  }

  async removeReview(id: number) {
    const deleted = await this.reviewsRepository.remove(
      this.reviewsRepository.create({ id }),
    );
    return { id };
  }

  private async getReviewForEmail(id: number) {
    const review = await this.reviewsRepository.findOne({
      relations: {
        translations: true,
        author: true,
      },
      select: {
        id: true,
        createdAt: true,
        status: true,
        author: {
          email: true,
          firstName: true,
          lastName: true,
          receiveEmails: true,
        },
      },
      where: {
        id: id,
        translations: {
          language: {
            id: LanguageIdEnum.RU,
          },
        },
      },
    });
    return review;
  }

  async checkUserRelation(userId: number, reviewId: number) {
    return await this.reviewsRepository.exists({
      where: {
        author: {
          id: Equal(userId),
        },
        id: Equal(reviewId),
      },
    });
  }

  async findMyReviews(
    langId: number,
    dto: MyReviewsRequestDto,
    tokenPayload: AccessTokenPayloadDto,
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
      skip: dto.page * dto.pageSize,
      take: dto.pageSize,
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

  async findAdminReviews(langId: number, dto: AdministrationReviewsRequestDto) {
    const orderDirection = dto.orderAsc ? 'ASC' : 'DESC';

    const res = await this.reviewsRepository.findAndCount({
      relations: {
        translations: true,
        place: { translations: true },
      },
      skip: dto.page * dto.pageSize,
      take: dto.pageSize,
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
        place: {
          id: dto.placeId,
          translations: {
            language: {
              id: langId,
            },
          },
        },
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

  async getReviewForEdit(id: number, langId: number) {
    const review = await this.reviewsRepository.findOne({
      relations: {
        translations: true,
        images: true,
        place: {
          translations: true,
        },
      },
      select: {
        id: true,
        images: true,
        translations: true,
        place: {
          id: true,
          translations: {
            title: true,
          },
        },
      },
      where: {
        id: id,
        translations: {
          language: {
            id: langId,
          },
        },
        place: {
          translations: {
            language: {
              id: langId,
            },
          },
        },
      },
      order: {
        images: {
          position: 'ASC',
        },
      },
    });
    if (!review) throw new NotFoundException({ message: 'Review not found' });
    return review;
  }

  async findModerationReviews(
    langId: number,
    dto: ModerationReviewsRequestDto,
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
        author: true,
      },
      skip: dto.page * dto.pageSize,
      take: dto.pageSize,
      order: {
        createdAt:
          dto.orderBy === ModerationReviewsOrderByEnum.CREATED_AT
            ? orderDirection
            : undefined,
        updatedAt:
          dto.orderBy === ModerationReviewsOrderByEnum.UPDATED_AT ||
          !dto.orderBy
            ? orderDirection
            : undefined,
        translations: {
          title:
            dto.orderBy === ModerationReviewsOrderByEnum.TITLE
              ? orderDirection
              : undefined,
        },
        place: {
          translations: {
            title:
              dto.orderBy === ModerationReviewsOrderByEnum.PLACE_TITLE
                ? orderDirection
                : undefined,
          },
        },
        author: {
          firstName:
            dto.orderBy === ModerationReviewsOrderByEnum.AUTHOR
              ? orderDirection
              : undefined,
          lastName:
            dto.orderBy === ModerationReviewsOrderByEnum.AUTHOR
              ? orderDirection
              : undefined,
        },
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
        author: {
          firstName: true,
          lastName: true,
          email: true,
        },
        createdAt: true,
        updatedAt: true,
      },
      where: {
        author: {
          email: dto.authorEmail ? ILike(`${dto.authorEmail}%`) : undefined,
        },
        place: {
          translations: {
            language: {
              id: langId,
            },
          },
        },
        updatedAt: getDateWhereOption(),
        status: ReviewStatusesEnum.MODERATION,
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

  async moderateReview(reviewId: number, dto: ModerationDto, moderator: User) {
    const review = await this.reviewsRepository.findOne({
      where: {
        id: reviewId,
      },
      select: {
        id: true,
      },
    });
    if (!review)
      throw new NotFoundException({
        message: 'Review not found',
      });

    const updatedStatus = dto.accept
      ? ReviewStatusesEnum.APPROVED
      : ReviewStatusesEnum.REJECTED;

    await this.reviewsRepository.save({
      id: review.id,
      moderator: moderator,
      status: updatedStatus,
      moderationMessage: dto.feedback || null,
    });

    const reviewForEmail = await this.getReviewForEmail(review.id);
    if (!reviewForEmail || !reviewForEmail.author.receiveEmails) return;

    const email = new ReviewEmail(
      {
        comment: dto.feedback,
        status: updatedStatus,
      },
      new ReviewForEmailDto(reviewForEmail),
    );
    await this.mailingService.sendEmail(email);

    return;
  }
}
