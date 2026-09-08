import {
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['admin', 'user']);
export const authProviderEnum = pgEnum('auth_provider', ['google', 'local']);

export const users = pgTable(
  'users',
  {
    id: varchar('id').primaryKey(),
    username: varchar('username').unique().notNull(),
    avatarKey: varchar('avatar_key'),
    email: varchar('email').unique().notNull(),
    password: varchar('password'),

    role: userRoleEnum('role').default('user').notNull(),

    provider: authProviderEnum('provider').default('local').notNull(),
    providerId: varchar('provider_id'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('provider_provider_id_idx').on(
      table.provider,
      table.providerId,
    ),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
