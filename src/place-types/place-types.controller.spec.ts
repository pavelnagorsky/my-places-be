import { Test, TestingModule } from '@nestjs/testing';
import { PlaceTypesController } from './place-types.controller';
import { PlaceTypesService } from './place-types.service';

describe('PlaceTypesController', () => {
  let controller: PlaceTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaceTypesController],
      providers: [PlaceTypesService],
    }).compile();

    controller = module.get<PlaceTypesController>(PlaceTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
