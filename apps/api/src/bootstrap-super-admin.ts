import * as argon2 from 'argon2';
import { PrismaClient, PrismaPg } from '@verifyng/database';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const name = process.env.SUPER_ADMIN_NAME;
  const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured');
  }

  if (!name || !email || !password) {
    throw new Error(
      'SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are required',
    );
  }

  if (password.length < 12) {
    throw new Error(
      'SUPER_ADMIN_PASSWORD must contain at least 12 characters',
    );
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        platformRole: true,
      },
    });

    if (existingUser) {
      throw new Error(
        'A user with this email already exists. Bootstrap will not modify an existing account.',
      );
    }

    const passwordHash = await argon2.hash(password);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email,
        passwordHash,
        emailVerified: true,
        platformRole: 'SUPER_ADMIN',
      },
      select: {
        id: true,
        name: true,
        email: true,
        platformRole: true,
      },
    });

    console.log('SUPER_ADMIN created successfully:');
    console.log(user);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
