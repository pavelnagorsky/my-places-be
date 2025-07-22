import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { Readable, Transform } from "stream";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { IYandexCloudConfig } from "../../../config/configuration";
import { ConfigService } from "@nestjs/config";
import { TTSDto } from "./dto/tts.dto";
import {
  ContainerAudioTypesEnum,
  IUtteranceSynthesisRequest,
  IUtteranceSynthesisResponse,
} from "./interfaces/interfaces";

@Injectable()
export class SpeechKitService {
  private readonly logger = new Logger(SpeechKitService.name);
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService
  ) {}

  async synthesizeSpeech(dto: TTSDto) {
    const requestBody: IUtteranceSynthesisRequest = {
      text: dto.text,
      hints: [
        {
          voice: dto.voice || "filipp",
        },
      ],
      outputAudioSpec: {
        containerAudio: {
          containerAudioType: ContainerAudioTypesEnum.MP3,
        },
      },
      // Automatically split long text to several utterances and bill accordingly
      unsafeMode: true,
    };

    this.logger.log(
      `Starting speech synthesis for text length: ${dto.text.length} chars`
    );

    try {
      const response = await firstValueFrom(
        this.httpService.post<IUtteranceSynthesisResponse>(
          "https://tts.api.cloud.yandex.net/tts/v3/utteranceSynthesis",
          requestBody,
          {
            headers: {
              Authorization: `Api-Key ${
                this.configService.get<IYandexCloudConfig>("yandexCloud")
                  ?.apiKey
              }`,
            },
          }
        )
      );

      this.logger.log("Successfully synthesized speech");

      let audioResponse: IUtteranceSynthesisResponse[] = [];
      if (typeof response.data === "string") {
        audioResponse = this.parseStreamedResponse(response.data);
      } else {
        audioResponse = [response.data];
      }
      return this.createAudioStream(audioResponse);
    } catch (error) {
      this.logger.error("Error synthesizing speech", error.message);
      throw new BadRequestException({
        message: "Failed to generate speech",
      });
    }
  }

  private parseStreamedResponse(
    ndjsonString: string
  ): IUtteranceSynthesisResponse[] {
    return ndjsonString
      .trim() // Remove leading/trailing whitespace
      .split("\n") // Split by newlines
      .map((line) => {
        try {
          return JSON.parse(line) as IUtteranceSynthesisResponse;
        } catch (e) {
          this.logger.error("Failed to parse chunk:", line);
          return null;
        }
      })
      .filter(Boolean) as IUtteranceSynthesisResponse[]; // Remove null entries
  }

  private createAudioStream(audioResponse: IUtteranceSynthesisResponse[]) {
    const audioStream = new Readable({ read() {} });

    // Process chunks incrementally
    for (const chunk of audioResponse) {
      const chunkBuffer = Buffer.from(chunk.result.audioChunk.data, "base64");
      audioStream.push(chunkBuffer);
    }

    audioStream.push(null); // End stream
    return audioStream;
  }
}
