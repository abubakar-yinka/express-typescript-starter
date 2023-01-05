import { ClassConstructor, plainToInstance } from 'class-transformer';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { validate, ValidationError, IsDefined } from 'class-validator';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { BadRequestError } from '@exceptions/HttpException';

// Use as first argument of the validation middleware - classInstance
export class CreateUserRequest {
  @IsDefined()
  userName!: string;
}
export default class RequestValidator {
  static validate = <T extends object>(
    classInstance: ClassConstructor<T>,
    value: string | 'body' | 'query' | 'params' = 'body',
    skipMissingProperties = false,
    whitelist = true,
    forbidNonWhitelisted = true,
  ): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction) => {
      // eslint-disable-next-line security/detect-object-injection
      const convertedObject = plainToInstance(classInstance, (req as any)[value]);
      await validate(convertedObject, { skipMissingProperties, whitelist, forbidNonWhitelisted }).then((errors: ValidationError[]) => {
        if (errors.length > 0) {
          let rawErrors: string[] = [];
          for (const errorItem of errors) {
            rawErrors = rawErrors.concat(...rawErrors, Object.values(errorItem.constraints ?? []));
          }
          const message = errors.map((error: ValidationError) => Object.values(error.constraints ?? {})).join(', ');
          next(new BadRequestError(message, rawErrors));
        } else {
          next();
        }
      });
      next();
    };
  };
}
