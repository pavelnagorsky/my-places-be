import { ApiProperty } from "@nestjs/swagger";
import { OauthProviderTypesEnum } from "../enums/oauth-provider-types.enum";

export class OAuthResponseDto {
  @ApiProperty({ description: "Provider user id", type: String })
  providerId: string;

  @ApiProperty({ description: "provider type", enum: OauthProviderTypesEnum })
  providerType: OauthProviderTypesEnum;

  @ApiProperty({ description: "User email", type: String })
  email: string;

  @ApiProperty({ description: "User first name", type: String })
  firstName: string;

  @ApiProperty({ description: "User last name", type: String })
  lastName: string;

  // Tokens

  @ApiProperty({ description: "Access token", type: String, nullable: true })
  accessToken: string | null;

  @ApiProperty({ description: "Refresh token", type: String, nullable: true })
  refreshToken: string | null;

  constructor(partial: Partial<OAuthResponseDto>) {
    Object.assign(this, partial);
  }
}
