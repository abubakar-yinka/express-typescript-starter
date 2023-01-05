/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { format, transports, createLogger } from 'winston';
import winstonDaily from 'winston-daily-rotate-file';
import { LOG_DIR, LOG_FORMAT, NODE_ENV } from '@config';
import morgan, { StreamOptions } from 'morgan';

const { combine, timestamp, splat, colorize } = format;

// logs dir
const logDir: string = join(__dirname, LOG_DIR!);

if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */

export class Logger {
  static getInstance = (service = 'general-purpose') => {
    const logger = createLogger({
      defaultMeta: { service },
      format: combine(
        timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        Logger.logFormat,
      ),
      transports: [
        // debug log setting
        Logger.getDebugLoggerTransport(),
        // error log setting
        Logger.getErrorLoggerTransport(),
      ],
      exceptionHandlers: [new transports.File({ filename: 'exceptions.log' })],
      rejectionHandlers: [new transports.File({ filename: 'rejections.log' })],
    });

    if (NODE_ENV !== 'production') {
      logger.add(
        new transports.Console({
          format: combine(splat(), colorize()),
        }),
      );
    }

    return logger;
  };

  static logFormat = format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`);

  static info = (message: string) => {
    Logger.info(message);
  };

  static error = (message: string) => {
    Logger.error(message);
  };

  static getErrorLoggerTransport = () => {
    return new winstonDaily({
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir + '/error', // log file /logs/error/*.log in save
      filename: `info-%DATE%.log`,
      maxFiles: 30, // 30 Days saved
      handleExceptions: true,
      json: false,
      zippedArchive: true,
    });
  };

  static getDebugLoggerTransport = () => {
    return new winstonDaily({
      level: 'debug',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir + '/debug', // log file /logs/debug/*.log in save
      filename: `info-%DATE%.log`,
      maxFiles: 30, // 30 Days saved
      json: false,
      zippedArchive: true,
    });
  };

  static getHttpLoggerInstance = () => {
    const logger = Logger.getInstance();

    const stream: StreamOptions = {
      write: (message: string) => {
        logger.info(message.substring(0, message.lastIndexOf('\n')));
      },
    };

    const skip = () => {
      const env = NODE_ENV || 'development';
      return env !== 'development';
    };

    const morganMiddleware = morgan(LOG_FORMAT ?? 'dev', { stream, skip });

    return morganMiddleware;
  };
}

export const logger = Logger.getInstance();
