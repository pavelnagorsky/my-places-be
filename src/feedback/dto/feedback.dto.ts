import { ApiProperty } from '@nestjs/swagger';
import { UserRequestTypesEnum } from '../enums/user-request-types.enum';
import { CrmStatusesEnum } from '../../shared/enums/crm-statuses.enum';
import { Feedback } from '../entities/feedback.entity';

export class FeedbackDto {
  @ApiProperty({ title: 'ID', type: Number })
  id: number;

  @ApiProperty({ title: 'Full name', type: String })
  fullName: string;

  @ApiProperty({ title: 'Email', type: String })
  email: string;

  @ApiProperty({ title: 'User request type', enum: UserRequestTypesEnum })
  userRequestType: UserRequestTypesEnum;

  @ApiProperty({ title: 'Phone', type: String, nullable: true })
  phone: string | null;

  @ApiProperty({ title: 'Message', type: String })
  message: string;

  @ApiProperty({ title: 'status', enum: CrmStatusesEnum })
  status: CrmStatusesEnum;

  @ApiProperty({ title: 'Created at', type: Date })
  createdAt: Date;

  constructor(partial: Partial<Feedback>) {
    Object.assign(this, partial);
  }
}
