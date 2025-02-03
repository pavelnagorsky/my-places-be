import { Test, TestingModule } from '@nestjs/testing';
import { ExcursionsService } from './excursions.service';

describe('ExcursionsService', () => {
  let service: ExcursionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExcursionsService],
    }).compile();

    service = module.get<ExcursionsService>(ExcursionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
