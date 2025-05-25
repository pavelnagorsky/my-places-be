import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { IGoogleCloudConfig } from "../../../config/configuration";
import { Strategy, VerifyCallback } from "passport-google-oauth2";
import { OAuth2Client } from "google-auth-library";

@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(Strategy, "google") {
  private oauth2Client: OAuth2Client;

  constructor(private config: ConfigService) {
    super({
      clientID: config.get<IGoogleCloudConfig>("googleCloud")?.clientId,
      clientSecret: config.get<IGoogleCloudConfig>("googleCloud")?.keyFilename,
      passReqToCallback: true, // To access the request body
    });
    this.oauth2Client = new OAuth2Client(
      config.get<IGoogleCloudConfig>("googleCloud")?.clientId,
      config.get<IGoogleCloudConfig>("googleCloud")?.keyFilename
    );
  }

  async validate(req: Request, done: VerifyCallback): Promise<any> {
    try {
      // 1. Get the auth code from frontend
      const { code } = req.body as any;

      // 2. Exchange code for tokens
      const { tokens } = await this.oauth2Client.getToken(code);

      // 3. Verify ID token
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken: tokens.id_token!,
        audience: this.config.get("GOOGLE_CLIENT_ID"),
      });

      const payload = ticket.getPayload();

      // 4. Return standardized user object
      console.log("google oauth", {
        googleId: payload?.sub,
        email: payload?.email,
        name: payload?.name,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      });
      done(null, {
        googleId: payload?.sub,
        email: payload?.email,
        name: payload?.name,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      });
    } catch (error) {
      done(new UnauthorizedException("Invalid authorization code"), false);
    }
  }
}
