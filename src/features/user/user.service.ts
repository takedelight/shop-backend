import { Inject, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { UserModel } from './core/user.model';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from './core/user.repository.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserMapper } from './mappers/user.mapper';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}

  async findAll() {
    const users = await this.userRepo.findAll();
    return users.map(UserMapper.toResponse);
  }

  async findById(userId: string) {
    const user = await this.userRepo.findById(userId);
    return UserMapper.toResponse(user);
  }

  async findByEmail(email: string) {
    const user = await this.userRepo.findByEmail(email);
    return UserMapper.toResponse(user);
  }

  async create(body: CreateUserDto) {
    const data = UserModel.create({
      username: body.username,
      email: body.email,
      password: body.password,
    });

    return this.userRepo.create(data);
  }

  async update(userId: string, dto: UpdateUserDto) {
    const existing = await this.userRepo.findById(userId);

    if (dto.password) {
      dto.password = await argon2.hash(dto.password);
    }

    const updated = UserModel.restore({
      id: existing.id,
      username: dto.username ?? existing.username,
      email: dto.email ?? existing.email,
      password: dto.password ?? existing.password,
      avatarKey: existing.avatarKey,
      role: existing.role,
      provider: existing.provider,
      providerId: existing.providerId,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    return this.userRepo.update(updated);
  }

  async delete(userId: string) {
    return this.userRepo.delete(userId);
  }
}
