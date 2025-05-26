import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

export class GoogleOneTapGuard extends AuthGuard("google-one-tap") {}
