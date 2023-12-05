import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesModule } from '../images/images.module';
import { TranslationsModule } from '../translations/translations.module';
import { Review } from './entities/review.entity';
import { Place } from '../places/entities/place.entity';
import { ReviewTitleTranslation } from './entities/review-title-translation.entity';
import { ReviewDescriptionTranslation } from './entities/review-description-translation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Review,
      Place,
      ReviewTitleTranslation,
      ReviewDescriptionTranslation,
    ]),
    ImagesModule,
    TranslationsModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
