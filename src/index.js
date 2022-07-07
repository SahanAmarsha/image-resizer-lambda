const aws = require("aws-sdk");
const sharp = require("sharp");
const s3 = new aws.S3();

exports.handler = async function (event, context) {
  console.log('Received S3 event:', JSON.stringify(event, null, 2));
  if(event.Records[0].eventName === "ObjectRemoved:Delete") {
    return;
  }
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;
  console.log(`Bucket: ${bucket}`, `Key: ${key}`);
  try {
    // get image from s3
    let image = await s3.getObject({ Bucket: bucket, Key: key}).promise();

    // resize image
    image = await sharp(image.Body);
    const metadata = await image.metadata();
    if(metadata.width > 900) {
      const resizedImage = await image.resize({ width: 900 }).toBuffer();
      // store image
      console.log("RESIZED IMAGE");
      await s3.putObject({ Bucket: bucket, Key: key, Body: resizedImage }).promise();
      return "RESIZED IMAGE"
    } else {
      console.log("NOT RESIZED IMAGE")
      return "NOT RESIZED IMAGE"
    }
  } catch (err) {
    context.fail(`Error resizing image: ${err}`);
  }

};