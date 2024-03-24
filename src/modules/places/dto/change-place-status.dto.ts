import { ApiProperty } from '@nestjs/swagger';
import { PlaceStatusesEnum } from '../enums/place-statuses.enum';
import { IsBoolean, IsDateString, IsEnum, ValidateIf } from 'class-validator';

export class ChangePlaceStatusDto {
  @ApiProperty({
    enum: PlaceStatusesEnum,
    description: 'Place status',
    required: true,
  })
  @IsEnum(PlaceStatusesEnum)
  status: PlaceStatusesEnum;

  @ApiProperty({
    type: Boolean,
    description: 'is place an advertisement',
    required: true,
  })
  @IsBoolean()
  advertisement: boolean;

  @ApiProperty({
    type: Date,
    description: 'advertisement end date',
    nullable: true,
  })
  @IsDateString()
  @ValidateIf((object) => {
    return (
      object?.status === PlaceStatusesEnum.APPROVED && object?.advertisement
    );
  })
  advEndDate?: string;

  @ApiProperty({
    type: String,
    description: 'message to user',
  })
  message?: string;
}
