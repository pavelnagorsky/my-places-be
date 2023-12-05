import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ImagesService } from '../images/images.service';
import { TranslationsService } from '../translations/translations.service';
import { Review } from './entities/review.entity';
import { User } from '../users/entities/user.entity';
import { FindManyOptions, Repository, SelectQueryBuilder } from 'typeorm';
import { Place } from '../places/entities/place.entity';
import { ReviewTitleTranslation } from './entities/review-title-translation.entity';
import { ReviewDescriptionTranslation } from './entities/review-description-translation.entity';
import { CreatePlaceDto } from '../places/dto/create-place.dto';
import { PlaceTitleTranslation } from '../places/entities/place-title-translation.entity';
import { PlaceDescriptionTranslation } from '../places/entities/place-description-translation.entity';
import { PlaceAddressTranslation } from '../places/entities/place-address-translation.entity';
import { UpdatePlaceDto } from '../places/dto/update-place.dto';
import { ITranslation } from '../translations/interfaces/translation.interface';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(Place)
    private placesRepository: Repository<Place>,
    @InjectRepository(ReviewTitleTranslation)
    private titleTranslationsRepository: Repository<ReviewTitleTranslation>,
    @InjectRepository(ReviewDescriptionTranslation)
    private descriptionTranslationsRepository: Repository<ReviewDescriptionTranslation>,
    private imagesService: ImagesService,
    private translationsService: TranslationsService,
  ) {}

  // create translations for review
  private async createTranslations(sourceLangId: number, dto: CreateReviewDto) {
    const allLanguages = await this.translationsService.getAllLanguages();

    const titleTranslations: ReviewTitleTranslation[] = [];
    const descriptionTranslations: ReviewDescriptionTranslation[] = [];

    await Promise.all(
      allLanguages.map(async (lang) => {
        // translate titles
        const newTitleTranslation = this.titleTranslationsRepository.create({
          language: {
            id: lang.id,
          },
          text:
            lang.id === sourceLangId
              ? dto.title
              : await this.translationsService.createGoogleTranslation(
                  dto.title,
                  lang.code,
                  sourceLangId,
                ),
          original: lang.id === sourceLangId,
        });
        titleTranslations.push(newTitleTranslation);

        // translate descriptions
        const newDescriptionTranslation =
          this.descriptionTranslationsRepository.create({
            language: {
              id: lang.id,
            },
            text:
              lang.id === sourceLangId
                ? dto.description
                : await this.translationsService.createGoogleTranslation(
                    dto.description,
                    lang.code,
                    sourceLangId,
                  ),
            original: lang.id === sourceLangId,
          });
        descriptionTranslations.push(newDescriptionTranslation);
        return;
      }),
    );

    return {
      titleTranslations,
      descriptionTranslations,
    };
  }

  // update place translations
  private async updateTranslations(
    sourceLangId: number,
    review: Review,
    dto: UpdateReviewDto,
    translateAll: boolean,
  ) {
    const titleTranslations: ReviewTitleTranslation[] = [];
    const descriptionTranslations: ReviewDescriptionTranslation[] = [];

    // helper function to merge update translations
    const mergeUpdateTranslations = async (
      arrayToSave: ITranslation[],
      translation: ITranslation,
      repository: Repository<ITranslation>,
    ) => {
      const newTranslation = repository.create({
        id: translation.id,
        language: {
          id: translation.language.id,
        },
        // update if this language was selected in request
        // translate if translateAll option was selected
        // else do not change
        text:
          translation.language.id === sourceLangId
            ? dto.title
            : translateAll
            ? await this.translationsService.createGoogleTranslation(
                dto.title,
                translation.language.code,
                sourceLangId,
              )
            : translation.text,
        original: translation.language.id === sourceLangId,
      });
      arrayToSave.push(newTranslation);
      return;
    };

    const updateTitleTranslations = review.titles.map(async (translation) => {
      // translate titles
      await mergeUpdateTranslations(
        titleTranslations,
        translation,
        this.titleTranslationsRepository,
      );
      return;
    });
    const updateDescriptionTranslations = review.descriptions.map(
      async (translation) => {
        // translate titles
        await mergeUpdateTranslations(
          descriptionTranslations,
          translation,
          this.descriptionTranslationsRepository,
        );
        return;
      },
    );

    await Promise.all([
      Promise.all(updateTitleTranslations),
      Promise.all(updateDescriptionTranslations),
    ]);

    return {
      titleTranslations,
      descriptionTranslations,
    };
  }

  private getReviewFindOptions(langId: number): FindManyOptions<Review> {
    return {
      relations: {
        images: true,
        titles: true,
        descriptions: true,
        author: true,
      },
      where: {
        titles: {
          language: {
            id: langId,
          },
        },
        descriptions: {
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

  // private selectReviewsQuery(
  //   qb: SelectQueryBuilder<Review>,
  //   langId: number,
  // ): SelectQueryBuilder<Review> {
  //   return qb
  //     .leftJoinAndSelect('review.images', 'image')
  //     .addOrderBy('image.position')
  //     .orderBy('review.createdAt', 'DESC')
  //     .leftJoinAndMapOne(
  //       'review.description',
  //       'translation',
  //       'description_t',
  //       'review.description = description_t.textId AND description_t.language = :langId',
  //       { langId },
  //     )
  //     .leftJoinAndMapOne(
  //       'review.title',
  //       'translation',
  //       'title_t',
  //       'review.title = title_t.textId AND title_t.language = :langId',
  //       { langId },
  //     )
  //     .leftJoinAndMapOne(
  //       'review.user',
  //       'user',
  //       'user',
  //       'review.authorId = user.id',
  //     );
  // }

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
    review.titles = translations.titleTranslations;
    review.descriptions = translations.descriptionTranslations;
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
    // const qb = this.reviewsRepository
    //   .createQueryBuilder('review')
    //   .where('review.placeId = :placeId', { placeId });
    // const totalCount = await this.reviewsRepository
    //   .createQueryBuilder('review')
    //   .where('review.placeId = :placeId', { placeId })
    //   .getCount();
    // const reviews = await this.selectReviewsQuery(qb, langId)
    //   .skip(lastIndex)
    //   .take(itemsPerPage)
    //   .getMany();
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
    // const qb = this.reviewsRepository.createQueryBuilder('review');
    // return this.selectReviewsQuery(qb, langId)
    //   .where('review.id = :id', {
    //     id: id,
    //   })
    //   .getOne();
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
