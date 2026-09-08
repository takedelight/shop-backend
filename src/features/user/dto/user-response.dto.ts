import { UserRole } from '../core/user.model';

export class UserResponseDto {
  id: string;
  username: string;
  email: string;
  avatarKey: string | null;
  role: UserRole;
}
