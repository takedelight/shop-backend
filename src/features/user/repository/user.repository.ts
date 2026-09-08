import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from 'src/infrastructure/database/database.module';
import { UserModel } from '../core/user.model';
import { IUserRepository } from '../core/user.repository.interface';
import { users } from '../entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findAll(): Promise<UserModel[]> {
    const rows = await this.db.select().from(users);

    return rows.map((row) => UserMapper.toDomain(row));
  }

  async findById(userId: string): Promise<UserModel> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    return UserMapper.toDomain(row);
  }

  async findByEmail(email: string): Promise<UserModel> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));

    return UserMapper.toDomain(row);
  }

  async create(user: UserModel): Promise<UserModel> {
    const [row] = await this.db
      .insert(users)
      .values(UserMapper.toPersistence(user))
      .returning();

    return UserMapper.toDomain(row);
  }

  async update(user: UserModel): Promise<void> {
    await this.db
      .update(users)
      .set(UserMapper.toPersistence(user))
      .where(eq(users.id, user.id));
  }

  async delete(userId: string): Promise<void> {
    await this.db.delete(users).where(eq(users.id, userId));
  }
}
