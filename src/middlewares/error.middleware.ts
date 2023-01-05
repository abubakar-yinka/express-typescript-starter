import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';
import { logger } from '@utils/logger';

export default class ErrorMiddleware {
  static handleError = () => {
    return async (error: HttpException, req: Request, res: Response, next: NextFunction) => {
      try {
        const status: number = error.statusCode || 500;
        const message: string = error.message || 'Something went wrong';
        const rawErrors: string[] = error.rawErrors || [];
        // const stack: string = error.stack || 'No stack trace available';

        logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
        res.status(status).json({ message, rawErrors });
      } catch (error) {
        next(error);
      }
    };
  };

  static initializeUnhandledException = () => {
    process.on('unhandledRejection', (reason: Error) => {
      logger.error(`[${reason.name}] >> ${reason.message}`);
      logger.info('UNHANDLED REJECTION! 💥 Shutting down...');
      throw reason;
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error(`[${error.name}] >> ${error.message}`);
      logger.info('UNCAUGHT EXCEPTION! 💥 Shutting down...');
      process.exit(1);
    });
  };
}
