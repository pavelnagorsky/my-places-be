import { Test, TestingModule } from '@nestjs/testing';
import { ExcursionsController } from './excursions.controller';
import { ExcursionsService } from './excursions.service';

describe('ExcursionsController', () => {
  let controller: ExcursionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExcursionsController],
      providers: [ExcursionsService],
    }).compile();

    controller = module.get<ExcursionsController>(ExcursionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
