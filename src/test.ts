import AWS from "aws-sdk";
import dotenv from "dotenv";
dotenv.config();

AWS.config.update({
  apiVersion: "2010-12-01",
  accessKeyId: process.env.AWS_ACCESS_KEY as string,
  secretAccessKey: process.env.AWS_SECRET_KEY as string,
  region: "eu-central-1",
});

const S3Instance = new AWS.S3();

const bucketParams = {
  Bucket: "photodropbucketkryv",
};

const params = {
  Bucket: "photodropbucketkryv",
  Key: "6a5cd8f3-578a-4d67-8403-a378d25763d4_water.jpeg",
  Expires:60
};


const main =async () => {
    console.log(S3Instance.getSignedUrl('getObject',params))
}
main()
