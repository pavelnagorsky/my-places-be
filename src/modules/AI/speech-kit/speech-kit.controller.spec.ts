import { Test, TestingModule } from '@nestjs/testing';
import { SpeechKitController } from './speech-kit.controller';
import { SpeechKitService } from './speech-kit.service';

describe('SpeechKitController', () => {
  let controller: SpeechKitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpeechKitController],
      providers: [SpeechKitService],
    }).compile();

    controller = module.get<SpeechKitController>(SpeechKitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
