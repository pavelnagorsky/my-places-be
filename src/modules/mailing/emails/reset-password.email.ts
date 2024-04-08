import { AbstractEmail } from './abstract.email';
import { User } from '../../users/entities/user.entity';

export class ResetPasswordEmail extends AbstractEmail {
  constructor(user: User, confirmLink: string) {
    super(true, 'reset-password');
    this.to = user.email;
    this.context = {
      firstName: user.firstName,
      lastName: user.lastName,
      link: confirmLink,
    };
  }

  subject = 'Сброс пароля';
}
