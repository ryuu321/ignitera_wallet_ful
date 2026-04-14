import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const username = "ryu";
  
  const user = await prisma.user.update({
    where: { anonymousName: username },
    data: { role: "MANAGER" },
  });

  console.log(`Successfully elevated ${user.anonymousName} to MANAGER.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
