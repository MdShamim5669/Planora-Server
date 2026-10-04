import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { Role } from "@prisma/client";
import { JwtPayload } from "./utils.interface";

export { JwtPayload };

export const signToken = (userId: string, role: Role): string => {
  const options: SignOptions = {
    algorithm: "HS256",
    expiresIn: env.JWT_EXPIRES_IN as any,
  };

  return jwt.sign({ sub: userId, role }, env.JWT_SECRET, options);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET, {
    algorithms: ["HS256"],
  }) as JwtPayload;
};
