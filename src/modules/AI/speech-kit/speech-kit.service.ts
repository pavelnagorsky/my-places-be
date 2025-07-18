import { Injectable, Logger } from "@nestjs/common";
import { Readable } from "stream";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { IYandexTranslateResponse } from "../translations/interfaces/translation.interface";
import { IYandexCloudConfig } from "../../../config/configuration";
import { ConfigService } from "@nestjs/config";
import { TTSDto } from "./dto/tts.dto";
import {
  ContainerAudioTypesEnum,
  IUtteranceSynthesisRequest,
} from "./interfaces/interfaces";

@Injectable()
export class SpeechKitService {
  private readonly logger = new Logger(SpeechKitService.name);
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService
  ) {}

  async synthesizeSpeech(dto: TTSDto): Promise<Readable> {
    const requestBody: IUtteranceSynthesisRequest = {
      text: dto.text,
      hints: [
        {
          voice: dto.voice || "filipp",
          speed: dto.voiceSpeed || "1.0",
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
        this.httpService.post(
          "https://translate.api.cloud.yandex.net/translate/v2/translate",
          requestBody,
          {
            headers: {
              Authorization: `Api-Key ${
                this.configService.get<IYandexCloudConfig>("yandexCloud")
                  ?.apiKey
              }`,
              "Content-Type": "application/json",
            },
            responseType: "stream",
          }
        )
      );

      this.logger.log("Successfully synthesized speech");
      return response.data;
    } catch (error) {
      this.logger.error("Error synthesizing speech", error.message);
      throw new Error("Failed to synthesize speech");
    }
  }
}
