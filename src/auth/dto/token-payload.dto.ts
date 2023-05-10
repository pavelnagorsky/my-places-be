import { Role } from '../../roles/entities/role.entity';

export class TokenPayloadDto {
  id: number;
  email: string;
  roles: Role[];

  constructor(partial: Partial<TokenPayloadDto>) {
    Object.assign(this, partial);
  }
}
