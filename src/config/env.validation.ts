import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  APP_PORT: z.coerce.number().default(5000),
  CORS_ORIGINS: z.string().transform((val) => JSON.parse(val) as string[]),

  ADMIN_EMAIL: z.email(),
  ADMIN_PASSWORD: z.string().min(6),

  DATABASE_URL: z.url(),

  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_URL: z.string(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(env: Record<string, unknown>): Env {
  return envSchema.parse(env);
}
