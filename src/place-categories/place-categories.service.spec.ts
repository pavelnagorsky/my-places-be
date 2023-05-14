import { Test, TestingModule } from '@nestjs/testing';
import { PlaceCategoriesService } from './place-categories.service';

describe('PlaceCategoriesService', () => {
  let service: PlaceCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlaceCategoriesService],
    }).compile();

    service = module.get<PlaceCategoriesService>(PlaceCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
