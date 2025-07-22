import { Module } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { ReviewsController } from "./reviews.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ImagesModule } from "../../../images/images.module";
import { TranslationsModule } from "../../../AI/translations/translations.module";
import { Review } from "./entities/review.entity";
import { Place } from "../../entities/place.entity";
import { ReviewTranslation } from "./entities/review-translation.entity";
import { MailingModule } from "../../../mailing/mailing.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, Place, ReviewTranslation]),
    ImagesModule,
    TranslationsModule,
    MailingModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
