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
  Key: "photo_2021-05-14_11-57-15.jpg",
};


const main =async () => {
    console.log(await S3Instance.getObject(params).promise())
}
main()
