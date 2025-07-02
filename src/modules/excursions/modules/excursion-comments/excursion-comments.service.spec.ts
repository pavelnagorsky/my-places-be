import { Test, TestingModule } from "@nestjs/testing";
import { ExcursionCommentsService } from "./excursion-comments.service";

describe("CommentsService", () => {
  let service: ExcursionCommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExcursionCommentsService],
    }).compile();

    service = module.get<ExcursionCommentsService>(ExcursionCommentsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
