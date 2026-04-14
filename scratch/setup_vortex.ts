import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminName = "Vortex";
  
  // Vortexを作成、またはMANAGERへ更新
  const user = await prisma.user.upsert({
    where: { anonymousName: adminName },
    update: { role: "MANAGER" },
    create: {
      anonymousName: adminName,
      role: "MANAGER",
      rank: "S",
      balanceFlow: 100000,
      balanceStock: 500000,
      balanceIgn: 10000,
      skillLevel: 2.0,
      totalScore: 5000,
    },
  });

  console.log(`System Admin '${user.anonymousName}' is now active with MANAGER privileges.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
