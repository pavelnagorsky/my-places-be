import { ApiProperty } from '@nestjs/swagger';

class ValidationMessageDto {
  @ApiProperty({ description: 'DTO field where error occurred', type: String })
  field: string;

  @ApiProperty({ description: 'Description of the error', type: String })
  error: string;
}

export class ValidationExceptionDto {
  @ApiProperty({ description: 'Status code of response', type: Number })
  statusCode: number;

  @ApiProperty({
    description: 'Info about the validation errors',
    type: ValidationMessageDto,
    isArray: true,
  })
  message: ValidationMessageDto[];

  @ApiProperty({ description: 'Network message of response', type: String })
  error: string;
}
