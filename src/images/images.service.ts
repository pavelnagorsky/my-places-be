import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './entities/image.entity';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private readonly imagesRepository: Repository<Image>,
    private readonly storageService: StorageService,
  ) {}

  async create(imageUrl: string) {
    const image = this.imagesRepository.create();
    image.url = imageUrl;
    return await this.imagesRepository.save(image);
  }

  async findAll() {
    return await this.imagesRepository.find();
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
    await this.imagesRepository.delete(image);
    return;
  }
}
