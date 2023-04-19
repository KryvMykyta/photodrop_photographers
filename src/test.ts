import { S3Repository } from "./S3/S3Repository";
import AWS from "aws-sdk";
import dotenv from "dotenv";
import { Pool } from "pg";
import { AlbumsRepository } from "./repositories/AlbumsRepository";
import { PhotoRepository } from "./repositories/PhotoRepository";
import { PhotographersRepository } from "./repositories/PhotographersRepository";
import { PhotoEditor } from "./utils/PhotoEditor";
import { TokenGenerator } from "./utils/TokenGenerator";
dotenv.config();

AWS.config.update({
  apiVersion: "2010-12-01",
  accessKeyId: process.env.AWS_ACCESS_KEY as string,
  secretAccessKey: process.env.AWS_SECRET_KEY as string,
  region: "eu-central-1",
});

const S3Instance = new AWS.S3();
const photographersPool = new Pool({
  connectionString: process.env.DB_CONN_STRING as string,
});

const tokenGenerator = new TokenGenerator()
const photoEditor = new PhotoEditor()

const photographersRepository = new PhotographersRepository(photographersPool)
const albumsRepository = new AlbumsRepository(photographersPool)
const s3Repository = new S3Repository(S3Instance)
const photosRepository = new PhotoRepository(photographersPool)


const bucketParams = {
  Bucket: "photodropbucketkryv",
};

const params = {
  Bucket: "photodropbucketkryv",
  Key: "photo_2021-05-14_11-57-15.jpg",
};


const main =async () => {
    // console.log(await S3Instance.getObject(params).promise())
    await photosRepository.addUsersToPhoto("e9938f22-7dd8-4cfd-a128-c03868e71ea1.jpg", ["123","456"])
}
main()
