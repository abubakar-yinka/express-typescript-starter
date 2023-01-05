import { DB_HOST, DB_PORT, DB_DATABASE, MONGODB_URI, MONGODB_URI_DEV } from '@config';

const connectionString = process.env.NODE_ENV === 'production' ? MONGODB_URI : MONGODB_URI_DEV;

export const dbConnection = {
  url: connectionString ?? `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
};
