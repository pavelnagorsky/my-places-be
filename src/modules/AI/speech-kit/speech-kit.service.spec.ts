import { Test, TestingModule } from '@nestjs/testing';
import { SpeechKitService } from './speech-kit.service';

describe('SpeechKitService', () => {
  let service: SpeechKitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpeechKitService],
    }).compile();

    service = module.get<SpeechKitService>(SpeechKitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
