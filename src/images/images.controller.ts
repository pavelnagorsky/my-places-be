import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { StorageService } from '../storage/storage.service';
import { ImageDto } from './dto/image.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { TokenPayload } from '../auth/decorators/token-payload.decorator';
import { AccessTokenPayloadDto } from '../auth/dto/access-token-payload.dto';
import { DeleteImageGuard } from './guards/delete-image.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
    tokenPayload: AccessTokenPayloadDto,
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
  @ApiBearerAuth('access-token')
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedException,
  })
  @ApiParam({
    name: 'id',
    description: 'image id',
  })
  @UseGuards(JwtAuthGuard, DeleteImageGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.imagesService.remove(id);
  }
}
