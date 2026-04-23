const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.hlkjhtazdlnwqmfkutqw:FinovaApp2026@db.hlkjhtazdlnwqmfkutqw.supabase.co:5432/postgres"
    }
  }
});

async function main() {
  try {
    const usersCount = await prisma.user.count();
    console.log(`Connection successful. Users count: ${usersCount}`);
  } catch (error) {
    console.error('Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
