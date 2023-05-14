import { Bucket, Storage } from '@google-cloud/storage';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { parse } from 'path';
import { ConfigService } from '@nestjs/config';
import { IGoogleCloudConfig } from '../config/configuration';
import { FileDto } from './dto/file.dto';

@Injectable()
export class StorageService {
  private bucket: Bucket;
  private storage: Storage;
  private readonly logger = new Logger('Storage service');

  constructor(private configService: ConfigService) {
    this.storage = new Storage({
      keyFilename:
        this.configService.get<IGoogleCloudConfig>('googleCloud')?.keyFilename,
    });
    this.bucket = this.storage.bucket(
      this.configService.get<IGoogleCloudConfig>('googleCloud')?.bucketName ||
        '',
    );
  }

  private setDestination(destination: string): string {
    let escDestination = '';
    escDestination += destination
      .replace(/^\.+/g, '')
      .replace(/^\/+|\/+$/g, '');
    if (escDestination !== '') escDestination = escDestination + '/';
    return escDestination;
  }

  private setFilename(uploadedFile: Express.Multer.File): string {
    const fileName = parse(uploadedFile.originalname);
    return `${fileName.name}-${Date.now()}${fileName.ext}`
      .replace(/^\.+/g, '')
      .replace(/^\/+/g, '')
      .replace(/[\r\n]/g, '_');
  }

  async uploadFile(
    uploadedFile: Express.Multer.File,
    destination: string,
  ): Promise<FileDto> {
    const fileName =
      this.setDestination(destination) + this.setFilename(uploadedFile);
    const file = this.bucket.file(fileName);
    this.logger.log(
      'new file',
      `https://storage.googleapis.com/${this.bucket.name}/${file.name}`,
    );
    try {
      await file.save(uploadedFile.buffer, {
        contentType: uploadedFile.mimetype,
      });
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
    return {
      publicUrl: `https://storage.googleapis.com/${this.bucket.name}/${file.name}`,
    };
  }

  async removeFile(fileName: string): Promise<void> {
    const sanitizedFileName = fileName.replace(
      `https://storage.googleapis.com/${this.bucket.name}/`,
      '',
    );
    const file = this.bucket.file(sanitizedFileName);
    try {
      await file.delete();
      this.logger.warn('file deleted');
      return;
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }
}
