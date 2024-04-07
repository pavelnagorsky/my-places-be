import { AbstractEmail } from './abstract.email';
import { ReviewStatusesEnum } from '../../reviews/enums/review-statuses.enum';
import { ReviewForEmailDto } from '../../reviews/dto/review-for-email.dto';

interface IReviewEmailPayload {
  status: ReviewStatusesEnum;
  comment?: string;
}

export class ReviewEmail extends AbstractEmail {
  constructor(config: IReviewEmailPayload, review: ReviewForEmailDto) {
    super(true, 'review');
    this.to = review.email;

    const textContent = this.prepareTextContent(config, review);

    this.subject = textContent.title;
    this.context = {
      firstName: review.firstName,
      lastName: review.lastName,
      info: textContent.info,
      title: textContent.title,
      comment:
        config.comment && config.comment.trim().length > 0
          ? config.comment
          : undefined,
    };
  }

  private prepareTextContent(
    config: IReviewEmailPayload,
    review: ReviewForEmailDto,
  ): {
    title: string;
    info: string;
  } {
    const infoTexts = this.buildInfoTexts(review);
    return {
      info: infoTexts[config.status],
      title: this.buildTitleText(config.status),
    };
  }

  private buildInfoTexts(review: ReviewForEmailDto) {
    const title = review.title.trim();
    const createdAt = review.createdAt.toLocaleDateString('by');
    return {
      [ReviewStatusesEnum.APPROVED]: `Созданная Вами Заметка "${title}" от ${createdAt} успешно прошла модерацию, и опубликована на сайте!`,
      [ReviewStatusesEnum.REJECTED]: `Созданная Вами Заметка "${title}" от ${createdAt} отклонена от публикации.`,
      [ReviewStatusesEnum.MODERATION]: `Созданная Вами Заметка "${title}" от ${createdAt} было возвращена на модерацию.`,
    };
  }

  private buildTitleText(status: ReviewStatusesEnum) {
    if (status === ReviewStatusesEnum.APPROVED) return 'Заметка опубликована';
    if (status === ReviewStatusesEnum.REJECTED)
      return 'Заметка отклонена от публикации';
    return 'Заметка переведена на модерацию';
  }

  subject: string;
}
