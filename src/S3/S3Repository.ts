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

  public getPhoto = async (photoKey: string) => {
    const params = {
      Bucket: this.bucketName,
      Key: photoKey,
    }
    return this.S3Instance.getObject(params)
  }

  public getPresignedPost = (photoKey: string) => {
    const params = {
      Bucket: this.bucketName,
      Key: photoKey,
      Expires: 300,
      Conditions: [["content-length-range", 0, 10 * 1024 * 1024], [ "eq", "$Content-Disposition", "attachment" ]],
      Fields: {
        acl: 'bucket-owner-full-control',
        key: photoKey,
        "Content-Disposition": "attachment"
      },
    }
    return this.S3Instance.createPresignedPost(params)
  }

  public getPhotoUrl = (photoKey: string) => {
    const params = {
      Bucket: this.bucketName,
      Key: photoKey,
      Expires: 60,
    }
    return this.S3Instance.getSignedUrl('getObject',params)
  }

}
