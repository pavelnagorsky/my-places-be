import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

export class VKOAuthGuard extends AuthGuard("vk-oauth") {}
