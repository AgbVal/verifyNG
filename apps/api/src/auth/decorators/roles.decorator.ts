import { SetMetadata } from '@nestjs/common';

export type ProducerRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: ProducerRole[]) =>
  SetMetadata(ROLES_KEY, roles);
