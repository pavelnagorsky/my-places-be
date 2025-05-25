import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { IGoogleCloudConfig } from "../../../config/configuration";
import { Strategy, VerifyCallback } from "passport-google-oauth2";
import { OAuth2Client } from "google-auth-library";

@Injectable()
export class GoogleOAuthOneTapStrategy extends PassportStrategy(
  Strategy,
  "google-one-tap"
) {
  private readonly client: OAuth2Client;

  constructor(private config: ConfigService) {
    console.log("oauth strategy constructor");
    super({
      clientID: config.get<IGoogleCloudConfig>("googleCloud")?.clientId,
      clientSecret: config.get<IGoogleCloudConfig>("googleCloud")?.keyFilename,
      passReqToCallback: false,
    });
    this.client = new OAuth2Client(
      config.get<IGoogleCloudConfig>("googleCloud")?.clientId,
      config.get<IGoogleCloudConfig>("googleCloud")?.keyFilename
    );
  }

  async validate(req: any): Promise<any> {
    const idToken = req.body.idToken || req.headers["x-id-token"];
    if (!idToken) {
      throw new UnauthorizedException("idToken is required");
    }

    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.config.get<IGoogleCloudConfig>("googleCloud")?.clientId,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new UnauthorizedException({
          message: "Invalid ID token payload",
        });
      }

      console.log("one-tap payload", payload);

      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };
    } catch (error) {
      throw new UnauthorizedException({ message: "Invalid Google ID token" });
    }
  }
}
