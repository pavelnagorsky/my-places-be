import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  Equal,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { FeedbackListRequestDto } from './dto/feedback-list-request.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
  ) {}

  async createFeedback(dto: CreateFeedbackDto) {
    const feedback = this.feedbackRepository.create({
      userRequestType: dto.userType,
      message: dto.message,
      email: dto.email,
      phone: dto.phone,
      fullName: dto.fullName,
    });
    await this.feedbackRepository.save(feedback);
    return;
  }

  async getFeedbackList(dto: FeedbackListRequestDto) {
    const getDateWhereOption = () => {
      if (!!dto.dateFrom && !!dto.dateTo)
        return Between(new Date(dto.dateFrom), new Date(dto.dateTo));
      if (!!dto.dateFrom) return MoreThanOrEqual(new Date(dto.dateFrom));
      if (!!dto.dateTo) return LessThanOrEqual(new Date(dto.dateTo));
      return undefined;
    };

    return await this.feedbackRepository.findAndCount({
      skip: dto.page * dto.pageSize,
      take: dto.pageSize,
      order: {
        createdAt: 'desc',
      },
      where: {
        createdAt: getDateWhereOption(),
        userRequestType:
          !!dto.requestTypes && dto.requestTypes.length > 0
            ? In(dto.requestTypes)
            : undefined,
        status:
          !!dto.statuses && dto.statuses.length > 0
            ? In(dto.statuses)
            : undefined,
        email:
          !!dto.authorEmail && dto.authorEmail.trim().length > 0
            ? ILike(`%${dto.authorEmail || ''}%`)
            : undefined,
      },
    });
  }

  async findOneById(id: number) {
    const feedback = await this.feedbackRepository.findOne({
      where: {
        id: Equal(id),
      },
    });
    return feedback;
  }

  async updateStatus(id: number, dto: UpdateStatusDto) {
    const feedback = await this.findOneById(id);
    if (!feedback)
      throw new NotFoundException({ message: 'Feedback not found' });
    feedback.status = dto.status;
    await this.feedbackRepository.save(feedback);
    return;
  }
}
