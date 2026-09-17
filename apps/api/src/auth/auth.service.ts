import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../database/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { ConsumerRegisterDto } from './dto/consumer-register.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    if (dto.cacNumber) {
      const existingProducer = await this.prisma.producer.findUnique({
        where: { cacNumber: dto.cacNumber },
      });

      if (existingProducer) {
        throw new ConflictException(
          'A producer with this CAC number already exists',
        );
      }
    }

    const passwordHash = await argon2.hash(dto.password);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: dto.name.trim(),
          email,
          passwordHash,
        },
      });

      const producer = await tx.producer.create({
        data: {
          companyName: dto.companyName.trim(),
          cacNumber: dto.cacNumber?.trim() || null,
        },
      });

      const membership = await tx.producerMembership.create({
        data: {
          userId: user.id,
          producerId: producer.id,
          role: 'OWNER',
        },
      });

      return {
        user,
        producer,
        membership,
      };
    });

    return {
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        emailVerified: result.user.emailVerified,
      },
      producer: {
        id: result.producer.id,
        companyName: result.producer.companyName,
        status: result.producer.status,
      },
      role: result.membership.role,
    };
  }
  
  async registerConsumer(dto: ConsumerRegisterDto) {
  const email = dto.email.trim().toLowerCase();

  const existingUser = await this.prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ConflictException('An account with this email already exists');
  }

  const passwordHash = await argon2.hash(dto.password);

  const user = await this.prisma.user.create({
    data: {
      name: dto.name.trim(),
      email,
      passwordHash,
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
    },
  };
}

 async getCurrentUser(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      producerMemberships: {
        include: {
          producer: true,
        },
      },
    },
  });

  if (!user || user.status !== 'ACTIVE') {
    throw new UnauthorizedException('Account is not active');
  }

  const membership = user.producerMemberships[0];

  const accountType = user.platformRole
    ? 'PLATFORM_ADMIN'
    : membership
      ? 'PRODUCER'
      : 'CONSUMER';

  return {
    accountType,

    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      platformRole: user.platformRole,
      createdAt: user.createdAt,
    },

    producer: membership
      ? {
          id: membership.producer.id,
          companyName: membership.producer.companyName,
          status: membership.producer.status,
          cacNumber: membership.producer.cacNumber,
        }
      : null,

    role: membership?.role ?? null,
  };
}

  async login(dto: LoginDto) {
  const email = dto.email.trim().toLowerCase();

  const user = await this.prisma.user.findUnique({
    where: { email },
    include: {
      producerMemberships: {
        include: {
          producer: true,
        },
      },
    },
  });

  if (!user) {
    throw new UnauthorizedException('Invalid email or password');
  }

  const passwordMatches = await argon2.verify(
    user.passwordHash,
    dto.password,
  );

  if (!passwordMatches) {
    throw new UnauthorizedException('Invalid email or password');
  }

  if (user.status !== 'ACTIVE') {
    throw new UnauthorizedException('Account is not active');
  }

 const membership = user.producerMemberships[0];

 const accountType = user.platformRole
    ? 'PLATFORM_ADMIN'
    : membership
      ? 'PRODUCER'
      : 'CONSUMER';

 const accessToken = await this.jwtService.signAsync({
   sub: user.id,
   accountType,
   producerId: membership?.producerId ?? null,
   role: membership?.role ?? null,
  });

  return {
    accessToken,
    tokenType: 'Bearer',
    expiresIn: 900,
    accountType,

   user: {
     id: user.id,
     name: user.name,
     email: user.email,
     platformRole: user.platformRole,
   },

   producer: membership
     ? {
         id: membership.producer.id,
         companyName: membership.producer.companyName,
         status: membership.producer.status,
       }
    : null,

   role: membership?.role ?? null,
  };
 }
}
