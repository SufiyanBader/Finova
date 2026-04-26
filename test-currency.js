const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const match = env.match(/DATABASE_URL="(.*)"/);
if (match) process.env.DATABASE_URL = match[1];

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const defaultAccount = await prisma.account.findFirst({
      where: { isDefault: true },
    });
    console.log("Default account currency:", defaultAccount ? defaultAccount.currency : "None");
    
    const assetPrice = await prisma.assetPrice.findUnique({
      where: { symbol_assetType: { symbol: 'AAPL', assetType: 'STOCK' } }
    });
    console.log("AAPL cached price:", assetPrice);
    
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
