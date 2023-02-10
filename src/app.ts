import { env } from './env';
import fastify from 'fastify';
import cookie from '@fastify/cookie';
import { transactionRoutes } from './routes/transactions';

const app = fastify();

app.register(cookie);
app.register(transactionRoutes, { prefix: 'transactions' });

export { app, env };
