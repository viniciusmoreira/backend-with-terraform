import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../errors/base.error';

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details: Record<string, string[]> = {};
        error.issues.forEach((issue) => {
          const path = issue.path.join('.') || 'body';
          if (!details[path]) {
            details[path] = [];
          }
          details[path].push(issue.message);
        });
        next(new ValidationError(details));
        return;
      }
      next(error);
    }
  };
};
