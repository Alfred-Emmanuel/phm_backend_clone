import { registerAs } from '@nestjs/config';
import appCustomConfig from './config';

export default registerAs('cloudinaryCredentials', () => {
  const cloudinarySettings = appCustomConfig.storage?.cloudinary;

  if (
    !cloudinarySettings?.CLOUD_NAME ||
    !cloudinarySettings?.API_KEY ||
    !cloudinarySettings?.API_SECRET
  ) {
    throw new Error(
      'Cloudinary configuration (CLOUD_NAME, API_KEY, API_SECRET) is missing in the main application config.',
    );
  }

  return {
    cloudName: cloudinarySettings.CLOUD_NAME,
    apiKey: cloudinarySettings.API_KEY,
    apiSecret: cloudinarySettings.API_SECRET,
  };
});