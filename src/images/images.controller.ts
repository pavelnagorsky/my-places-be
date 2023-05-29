import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
  ClassSerializerInterceptor,
  ParseIntPipe,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';
import {
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { StorageService } from '../storage/storage.service';
import { ImageDto } from './dto/image.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { TokenPayload } from '../auth/decorators/token-payload.decorator';
import { TokenPayloadDto } from '../auth/dto/token-payload.dto';

@ApiTags('Images')
@Controller('images')
export class ImagesController {
  constructor(
    private readonly imagesService: ImagesService,
    private readonly storageService: StorageService,
  ) {}

  @ApiOperation({ summary: 'Create new image' })
  @ApiOkResponse({ type: ImageDto })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 15728640 }, // 15MB --- 15*2^20
      fileFilter: (req, file, callback) => {
        return file.mimetype.match(/image\/(jpg|jpeg|png|gif|webp)$/)
          ? callback(null, true)
          : callback(
              new BadRequestException(
                'Invalid file type or maximum size limit exceeded',
              ),
              false,
            );
      },
    }),
  )
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Post()
  async create(
    @Body()
    fileDto: CreateImageDto,
    @UploadedFile()
    image: Express.Multer.File,
    @TokenPayload()
    tokenPayload: TokenPayloadDto,
  ): Promise<ImageDto> {
    if (!image) throw new BadRequestException('No file provided');
    const uploaded = await this.storageService.uploadFile(image, 'images');
    const savedImage = await this.imagesService.create(
      uploaded.publicUrl,
      tokenPayload,
    );
    return new ImageDto(savedImage);
  }

  @ApiOperation({ summary: 'Get all images' })
  @ApiOkResponse({ type: ImageDto, isArray: true })
  @Get()
  async findAll() {
    return await this.imagesService.findAll();
  }

  @ApiOperation({ summary: 'Delete image by id' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.imagesService.remove(id);
  }
}
