export default () => {
  return {
    port: parseInt(process.env.PORT ?? '', 10) || 3000,
    googleCloud: {
      projectId: process.env['GOOGLE_PROJECT_ID'],
      apiKey: process.env['GOOGLE_API_KEY'],
      bucketName: process.env['GOOGLE_BUCKET_NAME'],
      keyFilename: process.env['GOOGLE_CLOUD_KEY_NAME'],
    },
    database: {
      host: process.env['DATABASE_HOST'],
      name: process.env['DATABASE_NAME'],
      user: process.env['DATABASE_USER'],
      password: process.env['DATABASE_PASSWORD'],
    },
    jwt: {
      secret: process.env['JWT_SECRET'],
      expirationTime: process.env['JWT_EXPIRATION'],
    },
    emailConfig: {
      email: process.env['EMAIL'],
      emailPw: process.env['EMAIL_PW'],
    },
  };
};

export interface IGoogleCloudConfig {
  keyFilename: string;
  bucketName: string;
  projectId: string;
  apiKey: string;
}

export interface IDatabaseConfig {
  host: string;
  name: string;
  user: string;
  password: string;
}

export interface IJwtConfig {
  secret: string;
  expirationTime: string;
}

export interface IMailerConfig {
  email: string;
  emailPw: string;
}
