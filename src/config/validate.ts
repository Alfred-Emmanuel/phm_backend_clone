import { validationSchema } from './env.validation';

export function validate() {
  const { error } = validationSchema.validate(process.env, {
    abortEarly: false,
    allowUnknown: true,
  });

  if (error) {
    const missingVars = error.details
      .map((detail) => detail.message)
      .join('\n');
    throw new Error(`Environment validation failed:\n${missingVars}`);
  }
}
