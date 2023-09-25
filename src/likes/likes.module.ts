import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from '../places/entities/place.entity';
import { Like } from './entities/like.entity';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Place, Like])],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
