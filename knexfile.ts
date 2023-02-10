import { type Knex } from 'knex';
import { env } from './src/env';

const knexConfig: Knex.Config = {
  client: 'sqlite',
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: 'src/database/migrations',
  },
};

export default knexConfig;
