import { UtilsClasses } from './../app';
import { Request, Response, Router } from "express";
import { PhotographersRepository } from "./../repositories/PhotographersRepository";
import { ErrorGenerator } from "./../utils/ErrorGenerator";
import { TokenGenerator } from "./../utils/TokenGenerator";

export class AuthController {
  router: Router;
  path: string;
  photoRepo: PhotographersRepository;
  tokenGenerator: TokenGenerator;
  constructor(
    path: string,
    utilsClasses: UtilsClasses
  ) {
    (this.router = Router()), (this.path = path);
    this.photoRepo = utilsClasses.photographersRepository;
    this.tokenGenerator = utilsClasses.tokenGenerator;
    this.router.post("/login", this.login);
  }

  public login = async (
    req: Request<{}, {}, { login: string; password: string }, {}>,
    res: Response
  ) => {
    try {
      const { login, password } = req.body;
      console.log(login,password)
      if (!login || !password) throw new ErrorGenerator(502, "Bad Request");
      const foundPhotographer = await this.photoRepo.getPhotographerByLogin(
        login
      );
      if (!foundPhotographer || password !== foundPhotographer[0].password) {
        throw new ErrorGenerator(401, "Wrong credentials");
      }
      return res.status(200).send({
        accessToken: this.tokenGenerator.createAccessToken(login),
        login,
        id: foundPhotographer[0].PhotographerID,
      });
    } catch (err) {
      console.log(err);
      if (err instanceof ErrorGenerator) {
        return res.status(err.status).send(err.message);
      }
      return res.status(500).send("Server Error");
    }
  };
}
