import { Test, TestingModule } from '@nestjs/testing';
import { PlaceTypesService } from './place-types.service';

describe('PlaceTypesService', () => {
  let service: PlaceTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlaceTypesService],
    }).compile();

    service = module.get<PlaceTypesService>(PlaceTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
