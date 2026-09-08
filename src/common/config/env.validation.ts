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
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string().min(16),
  GOOGLE_CLIENT_SECRET: z.string().min(16),
  GOOGLE_CALLBACK_URL: z.string().min(16),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(env: Record<string, unknown>): Env {
  return envSchema.parse(env);
}
