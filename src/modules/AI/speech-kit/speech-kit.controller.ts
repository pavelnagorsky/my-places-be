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
  async synthesizeSpeech(@Body() dto: TTSDto, @Res() res: Response) {
    const audioStream = await this.speechKitService.synthesizeSpeech(dto);

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Disposition": `attachment; filename="speech.mp3"`,
      "Cache-Control": "no-store", // Important for dynamic content
      "Transfer-Encoding": "chunked",
    });

    audioStream.pipe(res);
  }
}
