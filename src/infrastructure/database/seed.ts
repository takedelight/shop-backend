import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as argon2 from 'argon2';
import { users } from './schema';

async function main() {
  console.log('Seeding database...');

  const client = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client });

  const hashedPassword = await argon2.hash(process.env.ADMIN_PASSWORD!);

  await db
    .insert(users)
    .values({
      id: randomUUID(),
      username: 'Oleksii Nikolaenko',
      email: process.env.ADMIN_EMAIL!,
      password: hashedPassword,
      role: 'admin',
    })
    .onConflictDoNothing();

  console.log('Seeding completed successfully!');
  await client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
