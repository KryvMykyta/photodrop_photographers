import S3 from "aws-sdk/clients/s3";
import dotenv from "dotenv";
dotenv.config();

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
}
