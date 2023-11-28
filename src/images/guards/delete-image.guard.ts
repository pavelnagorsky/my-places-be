import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { RequestWithTokenPayload } from '../../shared/types';
import { RoleNamesEnum } from '../../roles/enums/role-names.enum';
import { ImagesService } from '../images.service';

@Injectable()
export class DeleteImageGuard implements CanActivate {
  constructor(private imagesService: ImagesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithTokenPayload>();
    try {
      const tokenPayload = req.tokenPayload;
      if (!tokenPayload) throw new ForbiddenException();
      const roleNames = tokenPayload.roles.map((r) => r.name);
      // if admin or owner return true
      if (
        roleNames.includes(RoleNamesEnum.ADMIN) ||
        roleNames.includes(RoleNamesEnum.MODERATOR)
      )
        return true;
      // check if user is creator of image
      const imageId = req.params?.id;
      const image = await this.imagesService.findByIdAndUserId(
        +imageId,
        tokenPayload.id,
      );
      if (!image) return false;
      return true;
    } catch (error) {
      throw new ForbiddenException({ message: 'No access' });
    }
  }
}
