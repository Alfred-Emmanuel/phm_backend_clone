import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { Provider } from '@nestjs/common';

export const CloudinaryProvider: Provider = {
  provide: 'CLOUDINARY',
  useFactory: (configService: ConfigService) => {
    const cloudinarySettings = configService.get('cloudinaryCredentials');
    if (
      !cloudinarySettings?.cloudName ||
      !cloudinarySettings?.apiKey ||
      !cloudinarySettings?.apiSecret
    ) {
      throw new Error('Cloudinary configuration is missing.');
    }

    cloudinary.config({
      cloud_name: cloudinarySettings.cloudName,
      api_key: cloudinarySettings.apiKey,
      api_secret: cloudinarySettings.apiSecret,
    });

    return cloudinary;
  },
  inject: [ConfigService],
};
