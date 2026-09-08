import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

export const DRIZZLE = Symbol('DRIZZLE_CONNECTION');

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
