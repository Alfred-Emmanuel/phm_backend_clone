import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as Joi from 'joi';

@Injectable()
export class JoiValidationMiddleware implements NestMiddleware {
  constructor(private schema: Joi.ObjectSchema) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { error } = this.schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        statusCode: 400,
        message: error.details[0].message,
        error: 'Bad Request',
      });
    }
    next();
  }
}
