import { Test, TestingModule } from '@nestjs/testing';
import { PlaceCategoriesController } from './place-categories.controller';
import { PlaceCategoriesService } from './place-categories.service';

describe('PlaceCategoriesController', () => {
  let controller: PlaceCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaceCategoriesController],
      providers: [PlaceCategoriesService],
    }).compile();

    controller = module.get<PlaceCategoriesController>(PlaceCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
