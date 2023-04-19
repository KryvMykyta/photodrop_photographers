import { PhotosType } from "./../schemas/photoSchema";
import { Request, Response, Router } from "express";
import { AuthMiddlewareClass } from "./../middlewares/AuthMiddleware";
import { PhotographersRepository } from "./../repositories/PhotographersRepository";
import { AlbumsRepository } from "./../repositories/AlbumsRepository";
import { v4 as uuidv4 } from "uuid";
import { ErrorGenerator } from "./../utils/ErrorGenerator";
import { PhotoRepository } from "./../repositories/PhotoRepository";
import { UtilsClasses } from "app";
import { S3Repository } from "../S3/S3Repository";
import { PhotoEditor } from "utils/PhotoEditor";
import { PresignedPost } from "aws-sdk/clients/s3";

interface IResponsePhotos extends PhotosType {
  url: string;
}

export class PhotographersController {
  router: Router;
  path: string;
  photographerRepository: PhotographersRepository;
  authMiddleware: AuthMiddlewareClass;
  albumRepository: AlbumsRepository;
  photoRepository: PhotoRepository;
  s3Repository: S3Repository;
  photoEditor: PhotoEditor;

  constructor(path: string, utilsClasses: UtilsClasses) {
    (this.router = Router()), (this.path = path);
    this.authMiddleware = utilsClasses.authMiddleware;
    this.photographerRepository = utilsClasses.photographersRepository;
    this.albumRepository = utilsClasses.albumsRepository;
    this.photoRepository = utilsClasses.photosRepository;
    this.s3Repository = utilsClasses.s3Repository;
    this.photoEditor = utilsClasses.photoEditor;

    this.router.get(
      "/albums",
      this.authMiddleware.isAuthorized,
      this.getAlbums
    );
    this.router.post(
      "/addAlbum",
      this.authMiddleware.isAuthorized,
      this.addAlbum
    );
    this.router.post(
      "/addPhoto",
      this.authMiddleware.isAuthorized,
      this.addPhotoToAlbum
    );
    this.router.post(
      "/addUsers",
      this.authMiddleware.isAuthorized,
      this.addUsersToPhoto
    );

    this.router.get(
      "/photos",
      this.authMiddleware.isAuthorized,
      this.getAlbumPhotos
    );

    this.router.get(
      "/getPhoto",
      this.authMiddleware.isAuthorized,
      this.getPhoto
    );
  }

  public getPhoto = async (
    req: Request<{}, {}, { login: string }, { photoID: string }>,
    res: Response
  ) => {
    try {
      const { login } = req.body;
      const { photoID } = req.query;
      const photoData = await this.photoRepository.getPhoto(
        login,
        photoID
      );
      if (!photoData) {
        throw new ErrorGenerator(403, "Forbidden");
      }
      const url = this.s3Repository.getPhotoUrl(
        `original/${login}/${photoData[0].albumID}/${photoID}`
      );
      return res.status(200).send(url);
    } catch (err) {
      console.log(err);
      if (err instanceof ErrorGenerator) {
        return res.status(err.status).send(err.message);
      }
      return res.status(500).send("Server error");
    }
  };

  public getAlbumPhotos = async (
    req: Request<{}, {}, { login: string }, { albumID: string }>,
    res: Response
  ) => {
    try {
      const { login } = req.body;
      const { albumID } = req.query;
      const isUsersAlbum = await this.albumRepository.isUsersAlbum(
        login,
        albumID
      );
      if (!isUsersAlbum) {
        throw new ErrorGenerator(403, "Forbidden");
      }
      const photos = await this.photoRepository.getAlbumPhotos(albumID);
      const response: IResponsePhotos[] = [];
      for (let photo of photos) {
        const url = this.s3Repository.getPhotoUrl(
          `thumbnail/${login}/${albumID}/${photo.photoID}`
        );
        response.push(Object.assign(photo, { url }));
      }
      return res.status(200).send(response);
    } catch (err) {
      console.log(err);
      if (err instanceof ErrorGenerator) {
        return res.status(err.status).send(err.message);
      }
      return res.status(500).send("Server error");
    }
  };

  public getAlbums = async (
    req: Request<{}, {}, { login: string }, {}>,
    res: Response
  ) => {
    try {
      const { login } = req.body;
      const albums = await this.albumRepository.getPhotographerAlbumsByLogin(
        login
      );
      return res.status(200).send(albums);
    } catch (err) {
      console.log(err);
      return res.status(500).send("Server error");
    }
  };

  public addAlbum = async (
    req: Request<
      {},
      {},
      { login: string },
      { albumName: string; location: string; date: string }
    >,
    res: Response
  ) => {
    try {
      const { login } = req.body;
      const { albumName, location, date } = req.query;
      await this.albumRepository.addAlbumRecord(
        albumName,
        location,
        date,
        login
      );
      return res.status(200).send("Successfully created album");
    } catch (err) {
      console.log(err);
      return res.status(500).send("Server error");
    }
  };

  public addPhotoToAlbum = async (
    req: Request<
      {}, 
      {},
      { login: string; imageNames: string[] },
      { albumID: string}
    >,
    res: Response
  ) => {
    try {
      const { login, imageNames } = req.body;
      const { albumID} = req.query;
      const isUsersAlbum = await this.albumRepository.isUsersAlbum(
        login,
        albumID
      );
      if (!isUsersAlbum) {
        throw new ErrorGenerator(403, "Forbidden");
      }
      const urls: PresignedPost[] = [];
      imageNames.forEach((imagename) => {
        const type = imagename.split(".")[1];
        const photoKey = `original/${login}/${albumID}/${uuidv4()}.${type}`;
        urls.push(this.s3Repository.getPresignedPost(photoKey));
      });
      return res.status(200).send(urls);
    } catch (err) {
      console.log(err);
      if (err instanceof ErrorGenerator) {
        return res.status(err.status).send(err.message);
      }
      return res.status(500).send("Server error");
    }
  };

  public addUsersToPhoto = async (
    req: Request<
      {},
      {},
      { login: string, phones: string[] },
      { photoID: string }
    >,
    res: Response
  ) => {
    try {
      const { login, phones } = req.body;
      const { photoID } = req.query;
      const photoData = await this.photoRepository.getPhoto(
        login,
        photoID
      );
      if (!photoData) {
        throw new ErrorGenerator(403, "Forbidden");
      }
      await this.photoRepository.addUsersToPhoto(photoID, phones);
      return res.status(200).send("Successfully added user to photo");
    } catch (err) {
      console.log(err);
      return res.status(500).send("Server error");
    }
  };
}
