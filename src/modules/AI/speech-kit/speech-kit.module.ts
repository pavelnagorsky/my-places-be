import { Module } from "@nestjs/common";
import { SpeechKitService } from "./speech-kit.service";
import { SpeechKitController } from "./speech-kit.controller";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [HttpModule],
  controllers: [SpeechKitController],
  providers: [SpeechKitService],
})
export class SpeechKitModule {}
