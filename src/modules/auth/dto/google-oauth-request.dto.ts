import { ApiProperty } from "@nestjs/swagger";
import { GoogleOauthTypesEnum } from "../enums/google-oauth-types.enum";
import { IsEnum, IsString, ValidateIf } from "class-validator";

export class GoogleOauthRequestDto {
  @ApiProperty({ description: "Auth code", type: String })
  @IsString()
  @ValidateIf((object) => {
    return object.type === GoogleOauthTypesEnum.OAUTH;
  })
  authCode: string;

  @ApiProperty({ description: "One-Tap credentials code", type: String })
  @IsString()
  @ValidateIf((object) => {
    return object.type === GoogleOauthTypesEnum.ONE_TAP;
  })
  oneTapCode: string;

  @IsEnum(GoogleOauthTypesEnum)
  @ApiProperty({ description: "Auth type", enum: GoogleOauthTypesEnum })
  type: GoogleOauthTypesEnum;
}
