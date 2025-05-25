import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

export class GoogleOAuthOneTapGuard extends AuthGuard("google-one-tap") {}
