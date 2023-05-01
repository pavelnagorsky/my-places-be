import { CreateLanguageDto } from './create-language.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateLanguageDto extends PartialType(CreateLanguageDto) {}
