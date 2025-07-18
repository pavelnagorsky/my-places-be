import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, ValidateIf } from "class-validator";

export class TTSDto {
  @ApiProperty({
    title: "TTS text",
    type: String,
    default: "Some text to translate",
  })
  @MaxLength(10000)
  text: string;

  @ApiProperty({
    title: "Speaker name",
    type: String,
    required: false,
    default: "filipp",
  })
  @IsString()
  @ValidateIf((object, value) => !!value)
  voice?: string;

  @ApiProperty({
    title: "Voice speed",
    type: String,
    required: false,
    default: "1.0",
  })
  @IsString()
  @ValidateIf((object, value) => !!value)
  voiceSpeed?: string;
}
