import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DRIZZLE = Symbol('DRIZZLE_CONNECTION');
export type DrizzleDB = NodePgDatabase<typeof schema>;

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const connectionString =
          configService.getOrThrow<string>('DATABASE_URL');

        const client = new Pool({ connectionString });

        return drizzle({ client });
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DrizzleModule {}
