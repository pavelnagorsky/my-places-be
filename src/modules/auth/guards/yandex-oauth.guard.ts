import { AuthGuard } from "@nestjs/passport";

export class YandexOAuthGuard extends AuthGuard("yandex-oauth") {}
