import S3 from "aws-sdk/clients/s3";
import dotenv from "dotenv";
dotenv.config();
import { v4 as uuidv4 } from 'uuid';

export class S3Repository {
  S3Instance: S3;
  bucketName: string;

  constructor(s3: S3) {
    this.S3Instance = s3;
    this.bucketName = process.env.PHOTOS_BUCKET_NAME as string;
  }

  public loadPhoto = async (photoKey: string, bufferImage: Buffer, type: string) => {
    const params = {
      Bucket: this.bucketName,
      Key: `${photoKey}.${type}`,
      Body: bufferImage,
      ContentEncoding: "base64",
      ContentType: `image/${type}`,
    };
    console.log(params);
    await this.S3Instance.putObject(params).promise();
  };

  public getPhotoUrl = (photoKey: string, type: string) => {
    const requestKey = photoKey.replace('.', `${type}.`)
    const params = {
      Bucket: this.bucketName,
      Key: requestKey,
      Expires: 60,
    }
    return this.S3Instance.getSignedUrl('getObject',params)
  }

}
