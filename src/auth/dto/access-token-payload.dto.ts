import { Role } from '../../modules/roles/entities/role.entity';

export class AccessTokenPayloadDto {
  id: number;
  email: string;
  roles: Role[];

  constructor(partial: Partial<AccessTokenPayloadDto>) {
    Object.assign(this, partial);
  }
}
