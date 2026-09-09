import { randomUUID } from 'crypto';

export type UserRole = 'admin' | 'user';
export type AuthProvider = 'google' | 'local';

interface UserProps {
  id: string;
  username: string;
  avatarKey: string | null;
  email: string;
  password: string | null;
  role: UserRole;
  provider: AuthProvider;
  providerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateUserProps {
  username: string;
  avatarKey?: string | null;
  email: string;
  password?: string | null;
  provider?: AuthProvider;
  providerId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserModel {
  constructor(private readonly user: UserProps) {}

  static create(props: CreateUserProps): UserModel {
    const date = new Date();

    return new UserModel({
      id: randomUUID(),
      username: props.username,
      avatarKey: props.avatarKey ?? null,
      email: props.email,
      password: props.password ?? null,
      provider: props.provider ?? 'local',
      providerId: props.providerId ?? null,
      role: 'user',
      createdAt: date,
      updatedAt: date,
    });
  }

  static restore(user: UserProps): UserModel {
    return new UserModel(user);
  }

  get id(): string {
    return this.user.id;
  }

  get email(): string {
    return this.user.email;
  }

  get username(): string {
    return this.user.username;
  }

  get role(): UserRole {
    return this.user.role;
  }

  get avatarKey(): string | null {
    return this.user.avatarKey;
  }

  get provider(): AuthProvider {
    return this.user.provider;
  }

  get createdAt(): Date {
    return this.user.createdAt;
  }

  get providerId(): string | null {
    return this.user.providerId;
  }

  get password(): string | null {
    return this.user.password;
  }

  get updatedAt(): Date {
    return this.user.updatedAt;
  }

  isAdmin(): boolean {
    return this.user.role === 'admin';
  }

  isOAuthUser(): boolean {
    return this.user.provider === 'google';
  }

  canChangePassword(): boolean {
    return this.user.provider === 'local';
  }
}
