import { Body, Controller, Post, Res, StreamableFile } from "@nestjs/common";
import { SpeechKitService } from "./speech-kit.service";
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from "@nestjs/swagger";
import { Response } from "express";
import { TTSDto } from "./dto/tts.dto";

@ApiTags("AI: speech-kit")
@Controller("speech-kit")
export class SpeechKitController {
  constructor(private readonly speechKitService: SpeechKitService) {}

  @ApiOperation({
    summary: "Convert text to speech",
    description:
      "Converts provided text to speech audio using Yandex SpeechKit API",
  })
  @ApiOkResponse({
    description: "Audio stream in specified format",
    content: {
      "audio/mpeg": {
        schema: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @ApiBody({ type: TTSDto })
  @ApiProduces("audio/mpeg")
  @Post("/tts")
  async resetPassword(
    @Body() dto: TTSDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    const audioStream = await this.speechKitService.synthesizeSpeech(dto);
    // Set appropriate headers based on audio format
    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Disposition": 'inline; filename="speech.mp3"',
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    });

    return new StreamableFile(audioStream);
  }
}
