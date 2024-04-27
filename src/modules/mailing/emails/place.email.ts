import { AbstractEmail } from './abstract.email';
import { PlaceStatusesEnum } from '../../places/enums/place-statuses.enum';
import { PlaceForEmailDto } from '../../places/dto/place-for-email.dto';

type PlaceEmailPayload =
  | {
      // alert that commercial end date will be after 1 week
      commercialExpires: true;
      advDateChangedOnly?: never;
      advertisement?: never;
      status?: never;
      comment?: string;
    }
  | {
      // only advertisement end date changed
      advDateChangedOnly: true;
      advertisement?: never;
      status?: never;
      commercialExpires?: never;
      comment?: string;
    }
  | {
      // status changed
      status: PlaceStatusesEnum;
      advDateChangedOnly?: never;
      advertisement?: never;
      commercialExpires?: never;
      comment?: string;
    }
  | {
      // only advertisement changed
      advertisement: boolean;
      status?: never;
      comment?: string;
      commercialExpires?: never;
      advDateChangedOnly?: never;
    };

export class PlaceEmail extends AbstractEmail {
  constructor(config: PlaceEmailPayload, place: PlaceForEmailDto) {
    super('place');
    this.to = place.email;

    const textContent = this.prepareTextContent(config, place);

    this.subject = textContent.title;
    this.context = {
      firstName: place.firstName,
      lastName: place.lastName,
      info: textContent.info,
      title: textContent.title,
      comment:
        config.comment && config.comment.trim().length > 0
          ? config.comment
          : undefined,
      status: this.statuses[place.status].title,
      statusColor: this.statuses[place.status].color,
      advertisement: place.advertisement ? 'Да' : 'Нет',
      advEndDate: place.advEndDate
        ? place.advEndDate.toLocaleDateString('by')
        : null,
    };
  }

  private prepareTextContent(
    config: PlaceEmailPayload,
    place: PlaceForEmailDto,
  ): {
    title: string;
    info: string;
  } {
    const infoTexts = this.buildInfoTexts(place);
    if (config.commercialExpires) {
      const title = this.titles.commercialExpires;
      const info = infoTexts.commercialExpires;
      return { info, title };
    }
    if (config.advDateChangedOnly) {
      const title = this.titles.advEndDateChanged;
      const info = infoTexts.advEndDateChanged;
      return { info, title };
    }
    if (typeof config.advertisement === 'boolean') {
      const title = config.advertisement
        ? this.titles.commercial
        : this.titles.noncommercial;
      const info = config.advertisement
        ? infoTexts.turnedToCommercial
        : infoTexts.turnedFromCommercial;
      return { info, title };
    }
    return {
      info: infoTexts[config.status],
      title: this.titles.status,
    };
  }

  private buildInfoTexts(place: PlaceForEmailDto) {
    const title = place.title.trim();
    const createdAt = place.createdAt.toLocaleDateString('by');
    return {
      commercialExpires: `Напоминаем, что срок действия рекламы созданного Вами коммерческого Места "${title}" от ${createdAt} истекает через неделю. 
Для продления рекламы необходимо провести оплату, согласно установленным тарифам. В противном случае, после истечения текущего срока действия рекламы, Место будет исключено из списка опубликованных`,
      advEndDateChanged: `Срок окончания рекламы созданного Вами коммерческого Места "${title}" от ${createdAt} был обновлен админситрацией сайта.`,
      turnedToCommercial: `Согласно правилам данного сайта, созданное Вами Место "${title}" от ${createdAt} признано коммерческим.`,
      turnedFromCommercial: `Согласно правилам данного сайта, созданное Вами Место "${title}" от ${createdAt} признано некоммерческим.`,
      [PlaceStatusesEnum.COMMERCIAL_EXPIRED]: `Срок действия рекламы созданного Вами коммерческого Места "${title}" от ${createdAt} истек. Для возобновления публикации на сайте, необходимо провести оплату, согласно тарифу на рекламные услуги.`,
      [PlaceStatusesEnum.NEEDS_PAYMENT]: `Cогласно правилам данного сайта, созданное Вами Место "${title}" от ${createdAt} признано коммерческим, поэтому для его публикации необходимо провести оплату, согласно тарифу на рекламные услуги.`,
      [PlaceStatusesEnum.APPROVED]: `Созданное Вами Место "${title}" от ${createdAt} успешно прошло модерацию, и опубликовано на сайте!`,
      [PlaceStatusesEnum.REJECTED]: `Созданное Вами Место "${title}" от ${createdAt} отклонено от публикации.`,
      [PlaceStatusesEnum.MODERATION]: `Созданное Вами Место "${title}" от ${createdAt} было возвращено на модерацию.`,
    };
  }

  private statuses = {
    [PlaceStatusesEnum.COMMERCIAL_EXPIRED]: {
      title: 'Срок оплаты истек',
      color: '#d32f2f',
    },
    [PlaceStatusesEnum.NEEDS_PAYMENT]: {
      title: 'Ожидает оплаты',
      color: '#FD6B0C',
    },
    [PlaceStatusesEnum.APPROVED]: {
      title: 'Опубликовано',
      color: '#77D257',
    },
    [PlaceStatusesEnum.REJECTED]: {
      title: 'Отклонено',
      color: '#d32f2f',
    },
    [PlaceStatusesEnum.MODERATION]: {
      title: 'На модерации',
      color: '#FD6B0C',
    },
  };

  private titles = {
    status: 'Статус вашего места изменен',
    commercial: 'Место было переведено на коммерческую основу',
    noncommercial: 'Место было переведено на некоммерческую основу',
    advEndDateChanged: 'Срок действия рекламы обновлен',
    commercialExpires: 'Срок действия рекламы истекает',
  };

  subject: string;
}
