export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

export interface IVkOAuthTokensResponse {
  refresh_token: string;
  access_token: string;
  id_token: string;
  token_type: "Bearer";
  expires_in: number;
  user_id: number;
  state: string;
  scope: string;
  error?: string;
  error_description?: string;
}

export interface IVkUserResponse {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface IYandexOAuthTokensResponse {
  refresh_token: string;
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  scope: string;
  error?: string;
  error_description?: string;
}
