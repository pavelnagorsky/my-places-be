import { PaginationRequestDto } from '../../../shared/dto/pagination-request.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsString, ValidateIf } from 'class-validator';
import { RoleNamesEnum } from '../../roles/enums/role-names.enum';

export class UsersRequestDto extends PaginationRequestDto {
  @ApiProperty({ type: String, description: 'Date from' })
  @IsDateString()
  @ValidateIf((object, value) => Boolean(value))
  dateFrom?: string | null;
  @ApiProperty({ type: String, description: 'Date to' })
  @IsDateString()
  @ValidateIf((object, value) => Boolean(value))
  dateTo?: string | null;
  @ApiProperty({ type: String, description: 'Is blocked' })
  @IsBoolean()
  @ValidateIf((object, value) => typeof value !== 'undefined')
  isBlocked?: boolean;
  @ApiProperty({
    enum: RoleNamesEnum,
    isArray: true,
    description: 'Roles',
  })
  @IsString({ each: true })
  @ValidateIf((object, value) => Boolean(value))
  roles?: RoleNamesEnum[];
  @ApiProperty({ type: String, description: 'email' })
  @IsString()
  @ValidateIf((object, value) => Boolean(value))
  email?: string;
}
