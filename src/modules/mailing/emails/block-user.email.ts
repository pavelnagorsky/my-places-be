import { AbstractEmail } from './abstract.email';
import { ReviewStatusesEnum } from '../../reviews/enums/review-statuses.enum';
import { ReviewForEmailDto } from '../../reviews/dto/review-for-email.dto';
import { User } from '../../users/entities/user.entity';

interface IBlockUserEmailPayload {
  blocked: boolean;
  comment?: string;
}

export class BlockUserEmail extends AbstractEmail {
  constructor(config: IBlockUserEmailPayload, user: User) {
    super('block-user');
    this.to = user.email;

    const textContent = this.prepareTextContent(config, user);

    this.subject = textContent.title;
    this.context = {
      firstName: user.firstName,
      lastName: user.lastName,
      info: textContent.info,
      title: textContent.title,
    };
  }

  private prepareTextContent(
    config: IBlockUserEmailPayload,
    user: User,
  ): {
    title: string;
    info: string;
  } {
    return {
      info: this.buildInfoText(config, user),
      title: this.buildTitleText(config.blocked),
    };
  }

  private buildInfoText(config: IBlockUserEmailPayload, user: User) {
    const blockedUntil = user.blockedUntil
      ? user.blockedUntil.toLocaleDateString('by')
      : '';
    if (config.blocked) {
      return `По решению администрации сайта, Ваша учетная запись на сайте "Знай свой край" заблокирована до ${blockedUntil} по следующей причине: ${config.comment}`;
    }
    return `Ваша учетная запись на сайте "Знай свой край" разблокирована!`;
  }

  private buildTitleText(blocked: boolean) {
    if (blocked) return 'Ваша учетная запись заблокирована';
    return 'Ваша учетная запись разблокирована';
  }

  subject: string;
}
