import { type FastifyInstance } from 'fastify';
import { knex } from '../database/connection';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { checkSessionId } from '../middlewares/check-session-id';

export async function transactionRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/',
    {
      preHandler: [checkSessionId],
    },
    async (request) => {
      const { sessionId } = request.cookies;

      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select('*');

      return { transactions };
    }
  );

  app.get(
    '/:id',
    {
      preHandler: [checkSessionId],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies;

      const showTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = showTransactionParamsSchema.parse(request.params);

      const transaction = await knex('transactions')
        .where({ id, session_id: sessionId })
        .first();

      if (!transaction) {
        return await reply.status(404).send({ error: 'Transaction not found' });
      }

      return { transaction };
    }
  );

  app.get(
    '/summary',
    {
      preHandler: [checkSessionId],
    },
    async (request) => {
      const { sessionId } = request.cookies;

      const summary = await knex('transactions')
        .sum('amount', { as: 'amount' })
        .where('session_id', sessionId)
        .first();

      return { summary };
    }
  );

  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    });

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body
    );

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });
    }

    const transaction = await knex('transactions')
      .insert({
        id: randomUUID(),
        title,
        amount: type === 'credit' ? amount : amount * -1,
        session_id: sessionId,
      })
      .returning('*');

    return await reply.status(201).send(transaction);
  });
}
