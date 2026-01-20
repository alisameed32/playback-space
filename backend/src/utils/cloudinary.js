import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./apiError.js";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    //console.log("File uploaded to Cloudinary successfully", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (err) {
    fs.unlinkSync(localFilePath);
    console.error("Error uploading file to Cloudinary", err);
    return null;
  }
};

// Function to delete an by its public ID
const deleteOnCloudinary = async (assetUrl, resourceType = "image" ) => {
  try {
    if (!assetUrl) return null;
    // Extract public ID from the URL
    const publicId = assetUrl.split("/").pop().split(".")[0];
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true, // Set to true to purge CDN cache
    });
    console.log(result);
    return result;
  } catch (err) {
    console.error(err);
    throw new ApiError(500, "Failed to delete image from Cloudinary");
  }
};

export { uploadOnCloudinary, deleteOnCloudinary };
