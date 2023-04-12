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
  Key: "3d100f5b-1f82-4440-916a-f8704fe271d3_water_resize.jpeg",
  Expires:60
};

// S3Instance.getObject(params, (err, data) => {
//   if (err) {
//     console.log(err, err.stack);
//   } else {
//     console.log(data);
//   }
// });
const main =async () => {
    console.log(S3Instance.getSignedUrl('getObject',params))
}
main()
