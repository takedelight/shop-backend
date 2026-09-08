import { UserModel } from './user.model';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface IUserRepository {
  findAll(): Promise<UserModel[]>;
  findById(id: string): Promise<UserModel>;
  findByEmail(email: string): Promise<UserModel>;

  create(user: UserModel): Promise<void>;
  update(user: UserModel): Promise<void>;

  delete(id: string): Promise<void>;
}
