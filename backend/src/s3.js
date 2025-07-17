import AWS from "aws-sdk";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();
// Configure AWS S3

const s3 = new AWS.S3({
  region: "eu-west-3", // e.g., 'ap-south-1'
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Required
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Required
});

export async function uploadImageToS3(imageUrl) {
  // Step 1: Download the image from URL
  const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
  const contentType = response.headers["content-type"];
  const imageBuffer = Buffer.from(response.data);

  // Step 2: Generate random file name
  const extension = contentType.split("/")[1] || "png";
  const fileName = `${uuidv4()}.${extension}`;

  // Step 3: Upload to S3 with public-read ACL
  const uploadResult = await s3
    .upload({
      Bucket: "nexau-chatbot-generated-images",
      Key: fileName,
      Body: imageBuffer,
      ContentType: contentType,
    })
    .promise();
  console.log(uploadResult.Location);
  return uploadResult.Location; // this is the full public URL
}
