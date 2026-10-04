import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { env } from "../config/env";

export const generateToken = (
  payload: object,
  secret: Secret = env.JWT_SECRET,
  expiresIn: string = env.JWT_EXPIRES_IN
): string => {
  const options: SignOptions = {
    expiresIn: expiresIn as any,
  };
  return jwt.sign(payload, secret, options);
};

export const verifyTokenCustom = <T extends object>(
  token: string,
  secret: Secret = env.JWT_SECRET
): T => {
  return jwt.verify(token, secret) as T;
};

export const createResetPasswordToken = (userId: string, email: string): string => {
  return generateToken({ userId, email, type: "RESET_PASSWORD" }, env.JWT_SECRET, "1h");
};

export const createEmailVerificationToken = (userId: string, email: string): string => {
  return generateToken({ userId, email, type: "EMAIL_VERIFY" }, env.JWT_SECRET, "24h");
};
