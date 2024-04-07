import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, Equal } from 'typeorm';
import { Image } from './entities/image.entity';
import { StorageService } from '../storage/storage.service';
import { User } from '../users/entities/user.entity';
import { AccessTokenPayloadDto } from '../auth/dto/access-token-payload.dto';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private readonly imagesRepository: Repository<Image>,
    private readonly storageService: StorageService,
  ) {}

  async create(imageUrl: string, tokenPayload: AccessTokenPayloadDto) {
    const image = this.imagesRepository.create();
    image.url = imageUrl;
    image.user = new User();
    image.user.id = tokenPayload.id;
    return await this.imagesRepository.save(image);
  }

  async findByIdAndUserId(id: number, userId: number) {
    return await this.imagesRepository.findOne({
      where: {
        id: Equal(id),
        user: {
          id: Equal(userId),
        },
      },
    });
  }

  async updatePositions(imageIds: number[]): Promise<Image[]> {
    const images = await this.imagesRepository.findBy({
      id: In(imageIds),
    });

    return await this.imagesRepository.save(
      images.map((image) => {
        const newPosition = imageIds.findIndex((i) => i === image.id);
        return {
          ...image,
          position: newPosition,
        };
      }),
    );
  }

  async remove(id: number) {
    const image = await this.imagesRepository.findOne({
      where: {
        id: id,
      },
      select: ['id', 'url'],
    });
    if (!image) throw new NotFoundException();
    await this.storageService.removeFile(image.url);
    await this.imagesRepository.delete({ id: image.id });
    return;
  }
}
