import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { Role } from "@prisma/client";
import { IAuthPayload, ITokenOptions } from "./lib.interface";

export class Auth {
  // Password hashing
  static async hashPassword(password: string, saltRounds = 10): Promise<string> {
    return bcrypt.hash(password, saltRounds);
  }

  // Password comparison
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // JWT Token generation
  static generateToken(
    payload: { sub: string; role: Role; [key: string]: any },
    options: ITokenOptions = {}
  ): string {
    const signOpts: SignOptions = {
      expiresIn: (options.expiresIn || env.JWT_EXPIRES_IN) as any,
      algorithm: "HS256",
    };
    return jwt.sign(payload, env.JWT_SECRET, signOpts);
  }

  // JWT Token verification
  static verifyToken<T = any>(token: string): T {
    return jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
    }) as T;
  }
}

export default Auth;
