import * as argon2 from 'argon2';
import { PrismaClient, PrismaPg } from '@verifyng/database';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.NEW_ADMIN_PASSWORD;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured');
  }

  if (!email || !password) {
    throw new Error(
      'ADMIN_EMAIL and NEW_ADMIN_PASSWORD are required',
    );
  }

  if (password.length < 12) {
    throw new Error(
      'NEW_ADMIN_PASSWORD must contain at least 12 characters',
    );
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        platformRole: true,
      },
    });

    if (!user || !user.platformRole) {
      throw new Error('Platform administrator account not found');
    }

    const passwordHash = await argon2.hash(password);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    console.log(
      `Password reset successfully for platform administrator: ${user.email}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
