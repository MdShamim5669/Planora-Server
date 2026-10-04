import { Role } from "@prisma/client";
import { CookieOptions } from "express";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ResponsePayload<T> {
  statusCode?: number;
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
}

export interface JwtPayload {
  sub: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface IEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface ICookieOptions extends CookieOptions {
  name?: string;
  value?: string;
}

