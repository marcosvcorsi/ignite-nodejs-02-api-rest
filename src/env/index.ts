import { config } from 'dotenv';
import { z } from 'zod';

process.env.NODE_ENV === 'test' ? config({ path: '.env.test' }) : config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_URL: z.string(),
  PORT: z.number().default(3333),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  const errorMessage = 'Invalid environment variables';

  console.error(errorMessage, _env.error.format());

  throw new Error(errorMessage);
}

export const env = envSchema.parse(process.env);
