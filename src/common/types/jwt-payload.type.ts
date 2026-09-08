import { UserRole } from 'src/features/user/core/user.model';

export interface JwtPayload {
  sub: string;

  role: UserRole;

  sessionId: string;
}
