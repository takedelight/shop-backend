import { UserModel } from '../core/user.model';
import { UserResponseDto } from '../dto/user-response.dto';
import { NewUser, User } from '../entities/user.entity';

export class UserMapper {
  static toDomain(row: User): UserModel {
    return UserModel.restore({
      ...row,
    });
  }

  static toPersistence(user: UserModel): NewUser {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarKey: user.avatarKey,
      role: user.role,
      password: user.password,
      provider: user.provider,
      providerId: user.providerId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toResponse(user: UserModel): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarKey: user.avatarKey,
    };
  }
}
