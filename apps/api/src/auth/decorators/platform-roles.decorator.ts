import { SetMetadata } from '@nestjs/common';

export type PlatformRole =
  | 'REVIEWER'
  | 'OPERATIONS_ADMIN'
  | 'SUPER_ADMIN';

export const PLATFORM_ROLES_KEY = 'platformRoles';

export const PlatformRoles = (...roles: PlatformRole[]) =>
  SetMetadata(PLATFORM_ROLES_KEY, roles);
