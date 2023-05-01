import { CreateTranslationDto } from './create-translation.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateTranslationDto extends PartialType(CreateTranslationDto) {}
