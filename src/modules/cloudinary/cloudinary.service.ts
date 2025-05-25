// src/cloudinary/cloudinary.service.ts
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 as cloudinary } from 'cloudinary';

// It's good practice to use a stream for uploads, especially for larger files like videos.
// However, for simplicity in this example, we'll use the direct buffer upload.
// For production video uploads, consider 'upload_stream'.
// const streamifier = require('streamifier'); // Only if using upload_stream with buffer

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  // We don't need to inject ConfigService here as CloudinaryProvider already configured it.
  // The 'cloudinary' instance is globally configured by CloudinaryProvider.

  async uploadImage(
    file: Express.Multer.File,
    folderName: string = 'lms/course_images', // Optional: organize in Cloudinary folders
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    this.logger.log(`Uploading image to Cloudinary in folder: ${folderName}`);
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folderName,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            this.logger.error('Cloudinary image upload error:', error);
            return reject(new InternalServerErrorException('Failed to upload image.'));
          }
          if (result) {
            this.logger.log('Cloudinary image upload success:', result.secure_url);
            resolve(result);
          } else {
            // This case should ideally not happen if error is not present
            reject(new InternalServerErrorException('Image upload failed with no specific error.'));
          }
        },
      );
      // If using buffer:
      uploadStream.end(file.buffer);
      // If file.path is available (e.g., from Multer disk storage):
      // cloudinary.uploader.upload(file.path, { folder: folderName, resource_type: 'image' }, (error, result) => {...});
    });
  }
  
  async deleteAsset(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<any> {
    this.logger.log(`Deleting asset from Cloudinary: ${publicId}, type: ${resourceType}`);
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
        if (error) {
          this.logger.error(`Failed to delete asset ${publicId}:`, error);
          return reject(new InternalServerErrorException(`Failed to delete ${resourceType}.`));
        }
        this.logger.log(`Asset ${publicId} deleted successfully:`, result);
        resolve(result);
      });
    });
  }
  
  async uploadVideo(
    file: Express.Multer.File,
    folderName: string = 'lms/lesson_videos',
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    this.logger.log(`Uploading video to Cloudinary in folder: ${folderName}`);
    return new Promise((resolve, reject) => {
      // For videos, 'upload_stream' is highly recommended due to potential size.
      // The 'resource_type: "video"' is crucial.
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folderName,
          resource_type: 'video',
          chunk_size: 6000000, // Optional: Upload in chunks (e.g., 6MB)
          // Eager transformations can be specified here if needed (e.g., generate different formats)
          // eager: [
          //   { width: 300, height: 300, crop: "pad", audio_codec: "none" },
          //   { width: 160, height: 100, crop: "crop", gravity: "south", audio_codec: "none" }
          // ],
        },
        (error, result) => {
          if (error) {
            this.logger.error('Cloudinary video upload error:', error);
            return reject(new InternalServerErrorException('Failed to upload video.'));
          }
          if (result) {
            this.logger.log('Cloudinary video upload success:', result.secure_url);
            resolve(result);
          } else {
            reject(new InternalServerErrorException('Video upload failed with no specific error.'));
          }
        },
      );
      uploadStream.end(file.buffer);
    });
  }

}