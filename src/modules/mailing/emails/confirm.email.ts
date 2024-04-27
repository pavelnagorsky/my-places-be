import { AbstractEmail } from './abstract.email';
import { CreateUserDto } from '../../users/dto/create-user.dto';

export class ConfirmEmail extends AbstractEmail {
  constructor(user: CreateUserDto, confirmLink: string) {
    super('confirm-email');
    this.to = user.email;
    this.context = {
      firstName: user.firstName,
      lastName: user.lastName,
      link: confirmLink,
    };
  }

  subject = 'Подтверждение почты';
}
