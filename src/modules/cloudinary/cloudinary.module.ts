import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryService } from './cloudinary.service';
import { ConfigModule } from '@nestjs/config';
import cloudinaryCredentials from "../../config/cloudinary.config"

@Module({
  imports: [ConfigModule.forFeature(cloudinaryCredentials)],
  providers: [CloudinaryProvider, CloudinaryService],
  exports: ['CLOUDINARY', CloudinaryService],
})
export class CloudinaryModule {}
