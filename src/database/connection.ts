import { knex as setupKnex } from 'knex';
import knexConfig from '../../knexfile';

export const knex = setupKnex(knexConfig);
