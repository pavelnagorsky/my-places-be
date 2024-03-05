import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { RolesModule } from '../roles/roles.module';
import { Moderator } from './entities/moderator.entity';
import { LanguagesModule } from '../languages/languages.module';
import { RefreshTokenEntity } from '../auth/entities/refresh-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Moderator, RefreshTokenEntity]),
    RolesModule,
    LanguagesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
