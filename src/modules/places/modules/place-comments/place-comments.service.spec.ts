import { Test, TestingModule } from "@nestjs/testing";
import { PlaceCommentsService } from "./place-comments.service";

describe("CommentsService", () => {
  let service: PlaceCommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlaceCommentsService],
    }).compile();

    service = module.get<PlaceCommentsService>(PlaceCommentsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
