import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesModule } from '../images/images.module';
import { TranslationsModule } from '../translations/translations.module';
import { Review } from './entities/review.entity';
import { Place } from '../places/entities/place.entity';
import { ReviewTranslation } from './entities/review-translation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, Place, ReviewTranslation]),
    ImagesModule,
    TranslationsModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
