import { ApiProperty } from "@nestjs/swagger";
import { GoogleOauthTypesEnum } from "../enums/google-oauth-types.enum";
import { IsEnum, IsString, ValidateIf } from "class-validator";

export class YandexOauthRequestDto {
  @ApiProperty({ description: "Auth code", type: String })
  @IsString()
  authCode: string;
}
