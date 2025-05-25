import { ApiProperty } from "@nestjs/swagger";
import { GoogleOauthTypesEnum } from "../enums/google-oauth-types.enum";

export class GoogleOAuthDto {
  @ApiProperty({ description: "Auth code", type: String })
  authCode: string;

  @ApiProperty({ description: "Auth type", enum: GoogleOauthTypesEnum })
  type: GoogleOauthTypesEnum;
}
