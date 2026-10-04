import { Response } from "express";
import { CookieOptions } from "express";

export const defaultCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const setCookie = (
  res: Response,
  name: string,
  value: string,
  options: CookieOptions = {}
): void => {
  res.cookie(name, value, {
    ...defaultCookieOptions,
    ...options,
  });
};

export const setAuthCookie = (
  res: Response,
  token: string,
  options: CookieOptions = {}
): void => {
  setCookie(res, "planora_token", token, options);
};

export const clearCookie = (
  res: Response,
  name: string,
  options: CookieOptions = {}
): void => {
  res.clearCookie(name, {
    ...defaultCookieOptions,
    ...options,
  });
};

export const clearAuthCookie = (
  res: Response,
  options: CookieOptions = {}
): void => {
  clearCookie(res, "planora_token", options);
};
