// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { StatusCodes } from 'http-status-codes';

export class HttpException extends Error {
  public statusCode: number;
  rawErrors: string[] = [];

  constructor(statusCode: number, message: string, rawErrors?: string[]) {
    super(message);
    this.statusCode = statusCode;
    if (rawErrors) this.rawErrors = rawErrors;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends HttpException {
  constructor(path: string) {
    super(StatusCodes.NOT_FOUND, `The requested path ${path} not found!`);
  }
}

export class BadRequestError extends HttpException {
  constructor(message: string, errors: string[]) {
    super(StatusCodes.BAD_REQUEST, message, errors);
  }
}

export class ApplicationError extends HttpException {
  constructor(message: string, errors?: string[]) {
    super(StatusCodes.INTERNAL_SERVER_ERROR, message, errors);
  }
}

export class ServiceUnavailableError extends HttpException {
  constructor(message: string, errors?: string[]) {
    super(StatusCodes.SERVICE_UNAVAILABLE, message, errors);
  }
}
