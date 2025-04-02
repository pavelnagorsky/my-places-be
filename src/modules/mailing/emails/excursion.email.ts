import { AbstractEmail } from './abstract.email';
import { ExcursionStatusesEnum } from '../../excursions/enums/excursion-statuses.enum';
import { ExcursionForEmailDto } from '../../excursions/dto/excursion-for-email.dto';

export class ExcursionEmail extends AbstractEmail {
  constructor(dto: ExcursionForEmailDto) {
    super('excursion');
    this.to = dto.email;

    const textContent = this.prepareTextContent(dto);

    this.subject = textContent.title;
    this.context = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      info: textContent.info,
      title: textContent.title,
      comment:
        dto.moderationMessage && dto.moderationMessage.trim().length > 0
          ? dto.moderationMessage
          : undefined,
      status: this.statuses[dto.status].title,
      statusColor: this.statuses[dto.status].color,
    };
  }

  private prepareTextContent(dto: ExcursionForEmailDto): {
    title: string;
    info: string;
  } {
    const infoTexts = this.buildInfoTexts(dto);
    return {
      info: infoTexts[dto.status],
      title: this.titles.status,
    };
  }

  private buildInfoTexts(dto: ExcursionForEmailDto) {
    const title = dto.title.trim();
    const createdAt = dto.createdAt.toLocaleDateString('by');
    return {
      [ExcursionStatusesEnum.APPROVED]: `Созданная Вами Экскурсия "${title}" от ${createdAt} успешно прошла модерацию, и опубликована на сайте!`,
      [ExcursionStatusesEnum.REJECTED]: `Созданная Вами Экскурсия "${title}" от ${createdAt} отклонена от публикации.`,
      [ExcursionStatusesEnum.MODERATION]: `Созданная Вами Экскурсия "${title}" от ${createdAt} была возвращена на модерацию.`,
    };
  }

  private statuses = {
    [ExcursionStatusesEnum.APPROVED]: {
      title: 'Опубликована',
      color: '#77D257',
    },
    [ExcursionStatusesEnum.REJECTED]: {
      title: 'Отклонена',
      color: '#d32f2f',
    },
    [ExcursionStatusesEnum.MODERATION]: {
      title: 'На модерации',
      color: '#FD6B0C',
    },
  };

  private titles = {
    status: 'Статус вашей экскурсии изменен',
  };

  subject: string;
}
