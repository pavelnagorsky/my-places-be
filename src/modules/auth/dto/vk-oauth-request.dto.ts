import { ApiProperty } from "@nestjs/swagger";
import { GoogleOauthTypesEnum } from "../enums/google-oauth-types.enum";
import { IsEnum, IsString, ValidateIf } from "class-validator";

// Docs: https://id.vk.com/about/business/go/docs/ru/vkid/latest/vk-id/connection/api-description#Poluchenie-cherez-kod-podtverzhdeniya
export class VkOauthRequestDto {
  @ApiProperty({ description: "Auth code", type: String })
  @IsString()
  authCode: string;

  @ApiProperty({ description: "State", type: String })
  @IsString()
  state: string;

  @ApiProperty({ description: "Device ID", type: String })
  @IsString()
  deviceId: string;
}
