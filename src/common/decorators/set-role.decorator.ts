import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'Roles';

export const SetRoles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
