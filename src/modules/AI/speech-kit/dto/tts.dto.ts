import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, ValidateIf } from "class-validator";
import { Transform } from "class-transformer";
import { convert } from "html-to-text";

export class TTSDto {
  @ApiProperty({
    title: "TTS text",
    type: String,
    default: "Some text to translate",
    description: "HTML or plain text that will be converted to speech",
  })
  @IsString()
  @Transform(({ value, obj }) => {
    return convert(value.trim(), {
      wordwrap: false, // Disable line wrapping
      preserveNewlines: true, // Keep original line breaks
      selectors: [
        { selector: "a", options: { ignoreHref: true } }, // Simplify links
        { selector: "img", format: "skip" }, // Skip images
        { selector: "table", options: { uppercaseHeaderCells: false } }, // Handle tables
      ],
    });
  })
  @ValidateIf((o) => {
    // This ensures MaxLength validation runs after transform
    return true;
  })
  @MaxLength(5000, {
    message:
      "Text must be shorter than or equal to 5000 characters after HTML conversion",
  })
  text: string;

  @ApiProperty({
    title: "Speaker name",
    type: String,
    required: false,
    default: "filipp",
  })
  @IsString()
  @ValidateIf((object, value) => !!value)
  // https://yandex.cloud/ru/docs/speechkit/tts/voices
  voice?: string;
}
