import { v2 as cloudinary } from "cloudinary";
import { config } from "@/lib/config";

// Configure Cloudinary server-side
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});

export interface CloudinaryUploadResult {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export async function uploadImageBuffer(
  buffer: Buffer,
  folder = "postgram/uploads"
): Promise<CloudinaryUploadResult> {
  if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
    throw new Error("Cloudinary credentials are not configured in environment variables.");
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        transformation: [{ quality: "auto:eco" }, { fetch_format: "auto" }],
      },
      (error, result) => {
        if (error || !result) {
          reject(new Error(error?.message || "Failed to upload image to Cloudinary"));
        } else {
          resolve({
            publicId: result.public_id,
            secureUrl: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
}

export async function uploadImageFromUrl(
  url: string,
  folder = "postgram/uploads"
): Promise<CloudinaryUploadResult> {
  if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
    throw new Error("Cloudinary credentials are not configured.");
  }

  const result = await cloudinary.uploader.upload(url, {
    folder,
    resource_type: "auto",
  });

  return {
    publicId: result.public_id,
    secureUrl: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}
