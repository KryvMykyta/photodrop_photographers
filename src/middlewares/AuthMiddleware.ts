import { NextFunction, Request, RequestHandler, Response } from "express";
import { PhotographersRepository } from "./../repositories/PhotographersRepository";
import { ErrorGenerator } from "./../utils/ErrorGenerator";
import { TokenGenerator } from "./../utils/TokenGenerator";

export class AuthMiddlewareClass {
  photoRepo: PhotographersRepository;
  tokenGenerator: TokenGenerator;
  constructor(
    photoRepository: PhotographersRepository,
    tokenGenerator: TokenGenerator
  ) {
    this.photoRepo = photoRepository;
    this.tokenGenerator = tokenGenerator;
  }

  public isAuthorized: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.header("Authorization")?.split(" ")[1];
      if (!token) {
        throw new ErrorGenerator(401, "Unauthorized");
      }
      const decoded = this.tokenGenerator.verifyToken(token) as {login: string}
      const userFound = this.photoRepo.getPhotographerByLogin(decoded.login)
      if (!userFound) {
        throw new ErrorGenerator(401, "Unauthorized");
      }
      req.body.login = decoded.login
      next()
    } catch (err) {
      console.log(err);
      if (err instanceof ErrorGenerator) {
        return res.status(err.status).send(err.message);
      }
      return res.status(500).send("Server Error");
    }
  };
}


