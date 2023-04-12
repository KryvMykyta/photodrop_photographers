import { AuthController } from "./controllers/AuthController";
import { Pool } from "pg";
import express from 'express'
import dotenv from "dotenv";
dotenv.config();
import cors from 'cors'
import AWS from 'aws-sdk';
import { PhotographersRepository } from './repositories/PhotographersRepository';
import { TokenGenerator } from './utils/TokenGenerator';
import { AuthMiddlewareClass } from "./middlewares/AuthMiddleware";
import { PhotographersController } from "./controllers/PhotographersController";
import { AlbumsRepository } from "./repositories/AlbumsRepository";
import { S3Repository } from "./S3/S3Repository";
import { PhotoRepository } from "./repositories/PhotoRepository";
import { PhotoEditor } from "./utils/PhotoEditor";

const app = express()
const PORT = 3000

app.use(express.json({limit: '300mb'}))
app.use(cors())

AWS.config.update({
    apiVersion: "latest",
    accessKeyId: process.env.AWS_ACCESS_KEY as string,
    secretAccessKey: process.env.AWS_SECRET_KEY as string,
    region: 'eu-central-1'
})

const S3Instance = new AWS.S3()

const photographersPool = new Pool({
    connectionString: process.env.DB_CONN_STRING as string,
});

const tokenGenerator = new TokenGenerator()
const photoEditor = new PhotoEditor()

const photographersRepository = new PhotographersRepository(photographersPool)
const albumsRepository = new AlbumsRepository(photographersPool)
const s3Repository = new S3Repository(S3Instance)
const photosRepository = new PhotoRepository(photographersPool)

const authMiddleware = new AuthMiddlewareClass(photographersRepository, tokenGenerator)

const utilsClasses = {
    photographersRepository,
    albumsRepository,
    s3Repository,
    photosRepository,
    authMiddleware,
    tokenGenerator,
    photoEditor
}

export type UtilsClasses = typeof utilsClasses

const authController = new AuthController("/auth", utilsClasses)
const photographersController = new PhotographersController("/info", utilsClasses)

const controllers = [authController, photographersController]
controllers.forEach((controller) => {
    app.use(controller.path, controller.router)
})


app.listen(PORT, () => {
    console.log("started")
})