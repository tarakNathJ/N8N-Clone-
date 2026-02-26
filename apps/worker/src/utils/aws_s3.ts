


import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import type { AwsCredentialIdentity } from "@aws-sdk/types";
import axios from "axios";
import fs from "fs";
import path from "path";
import { config } from "dotenv";

config();

class aws_s3_service_provider {
  private s3_client: S3Client;
  private bucket_name: string;

  constructor() {
    const bucket = process.env.AWS_S3_BUCKET_NAME;
    const region = process.env.AWS_S3_REGION;
    const access_key = process.env.AWS_S3_ACCESS_KEY;
    const secret_key = process.env.AWS_S3_SECRET_KEY;

    if (!bucket || !region || !access_key || !secret_key) {
      throw new Error("Missing required AWS environment variables");
    }

    this.bucket_name = bucket;
    this.s3_client = new S3Client({
      region,
      credentials: {
        accessKeyId: access_key,
        secretAccessKey: secret_key,
      } as AwsCredentialIdentity,
    });
  }

  private async generate_presigned_url(filename: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket_name,
      Key: filename,
    });
   
    return await getSignedUrl(this.s3_client, command, { expiresIn: 60 * 20 });
  }

  public async download_file(filename: string): Promise<string | false> {
    try {
      const presigned_url = await this.generate_presigned_url(filename);

  
      const response = await axios.get(presigned_url, {
        responseType: "stream",
      });

      const folder = "./emails";
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }

 
      const safe_name = `${Date.now()}_${path.basename(filename)}`;
      const file_path = path.join(folder, safe_name);


      await new Promise<void>((resolve, reject) => {
        const writer = fs.createWriteStream(file_path);
        response.data.pipe(writer);
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      return file_path;
    } catch (error: any) {
      console.error("s3 download_file error:", error.message);
      return false;
    }
  }
}

export { aws_s3_service_provider };