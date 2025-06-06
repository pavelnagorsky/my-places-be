export default () => {
  return {
    port: parseInt(process.env.PORT ?? "", 10) || 3000,
    googleCloud: {
      projectId: process.env["GOOGLE_PROJECT_ID"],
      apiKey: process.env["GOOGLE_API_KEY"],
      bucketName: process.env["GOOGLE_BUCKET_NAME"],
      keyFilename: process.env["GOOGLE_CLOUD_KEY_NAME"],
      clientId: process.env["GOOGLE_CLOUD_CLIENT_ID"],
      clientSecret: process.env["GOOGLE_CLOUD_CLIENT_SECRET"],
    },
    yandexCloud: {
      apiKey: process.env["YANDEX_API_KEY"],
      clientId: process.env["YANDEX_CLIENT_ID"],
      clientSecret: process.env["YANDEX_CLIENT_SECRET"],
    },
    vk: {
      clientId: process.env["VK_CLIENT_ID"],
      codeVerifier: process.env["VK_CODE_VERIFIER"],
    },
    database: {
      host: process.env["DATABASE_HOST"],
      name: process.env["DATABASE_NAME"],
      user: process.env["DATABASE_USER"],
      password: process.env["DATABASE_PASSWORD"],
      port: parseInt(process.env["DATABASE_PORT"] ?? "", 10) || 3306,
    },
    jwt: {
      accessTokenSecret: process.env["ACCESS_TOKEN_SECRET"],
      accessTokenExpiration: process.env["ACCESS_TOKEN_EXPIRATION"],
      emailTokenSecret: process.env["EMAIL_TOKEN_SECRET"],
      emailTokenExpiration: process.env["EMAIL_TOKEN_EXPIRATION"],
      resetPasswordTokenSecret: process.env["RESET_PASSWORD_TOKEN_SECRET"],
      resetPasswordTokenExpiration:
        process.env["RESET_PASSWORD_TOKEN_EXPIRATION"],
      refreshTokenSecret: process.env["REFRESH_TOKEN_SECRET"],
      refreshTokenExpiration: process.env["REFRESH_TOKEN_EXPIRATION"],
    },
    frontend: {
      domain: process.env["DOMAIN"],
    },
    emailConfig: {
      email: process.env["EMAIL"],
      emailPw: process.env["EMAIL_PW"],
    },
  };
};

export interface IGoogleCloudConfig {
  keyFilename: string;
  bucketName: string;
  projectId: string;
  apiKey: string;
  clientId: string;
  clientSecret: string;
}

export interface IYandexCloudConfig {
  apiKey: string;
  clientId: string;
  clientSecret: string;
}

export interface IVKConfig {
  clientId: string;
  codeVerifier: string;
}

export interface IDatabaseConfig {
  host: string;
  name: string;
  user: string;
  password: string;
  port: number;
}

export interface IJwtConfig {
  accessTokenSecret: string;
  accessTokenExpiration: string;
  emailTokenSecret: string;
  emailTokenExpiration: string;
  resetPasswordTokenSecret: string;
  resetPasswordTokenExpiration: string;
  refreshTokenSecret: string;
  refreshTokenExpiration: string;
}

export interface IMailerConfig {
  email: string;
  emailPw: string;
}

export interface IFrontendConfig {
  domain: string;
}
