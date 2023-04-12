import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ErrorGenerator } from "./ErrorGenerator";
dotenv.config();

const secret = process.env.SECRET_KEY as string;

export class TokenGenerator {
  public createAccessToken = (login: string) => {
    const accessToken = jwt.sign({ login }, secret, {
      expiresIn: `24h`,
    });
    return accessToken
  };
  
  public createRefreshToken = (id: string) => {
    const refreshToken = jwt.sign({ id }, secret, {
      expiresIn: `7d`,
    });
    return refreshToken
  };

  public verifyToken = (token: string) => {
    try {
      const decoded = jwt.verify(token, secret)
      return decoded
    } catch(err) {
      throw new ErrorGenerator(401, "Unauthorized")
    }
  }
}
