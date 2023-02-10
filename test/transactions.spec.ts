import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'node:child_process';
import request from 'supertest';
import { app } from '../src/app';
import { beforeEach } from 'node:test';

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
  });

  it('should be able to create a new transaction', async () => {
    const response = await request(app.server).post('/transactions').send({
      title: 'any_title',
      amount: 1000,
      type: 'credit',
    });

    expect(response.statusCode).equal(201);
  });

  it('should be able to list all transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'any_title',
        amount: 1000,
        type: 'credit',
      });

    const cookies = createTransactionResponse.get('Set-Cookie');

    const response = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies);

    expect(response.statusCode).toBe(200);
    expect(response.body.transactions).toEqual([
      expect.objectContaining({
        title: 'any_title',
        amount: 1000,
      }),
    ]);
  });

  it('should be able to get specific transaction', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'any_title',
        amount: 1000,
        type: 'credit',
      });

    const cookies = createTransactionResponse.get('Set-Cookie');

    const id = createTransactionResponse.body.id as string;

    const response = await request(app.server)
      .get(`/transactions/${id}`)
      .set('Cookie', cookies);

    expect(response.statusCode).toBe(200);
    expect(response.body.transaction).toEqual(
      expect.objectContaining({
        title: 'any_title',
        amount: 1000,
      })
    );
  });

  it('should be able to get the summary', async () => {
    const creditTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Any credit',
        amount: 1000,
        type: 'credit',
      });

    const cookies = creditTransactionResponse.get('Set-Cookie');

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'Any debit',
        amount: 500,
        type: 'debit',
      });

    const response = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies);

    expect(response.statusCode).toBe(200);
    expect(response.body.summary).toEqual(
      expect.objectContaining({
        amount: 500,
      })
    );
  });
});
