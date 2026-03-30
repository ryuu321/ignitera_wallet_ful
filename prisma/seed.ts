import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('--- Reseting for Neutral Ecosystem Simulation ---')
  
  // Clean
  await prisma.bid.deleteMany({})
  await prisma.transaction.deleteMany({})
  await prisma.taskMessage.deleteMany({})
  await prisma.task.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.skillMaster.deleteMany({})

  // 1. Skill Masters
  const skills = [
    { name: 'Next.js', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'Prisma', category: 'Infrastructure' },
    { name: 'System Architecture', category: 'Consulting' },
    { name: 'UI/UX Design', category: 'Design' },
    { name: 'Strategy Planning', category: 'Managerial' },
    { name: 'Framer Motion', category: 'Frontend' }
  ]
  for (const s of skills) {
    await prisma.skillMaster.create({ data: s })
  }

  // 2. Users (Rank S to E)
  const users = [
    { anonymousName: 'Lumi (Architect)', role: 'SPECIALIST', rank: 'S', skillLevel: 2.0, balanceFlow: 5000, balanceStock: 1200, evaluationScore: 98.5, skills: JSON.stringify(['Next.js', 'System Architecture']) },
    { anonymousName: 'Nova (Lead)', role: 'MANAGER', rank: 'A', skillLevel: 1.5, balanceFlow: 8000, balanceStock: 800, evaluationScore: 88.0, skills: JSON.stringify(['Strategy Planning', 'Next.js']) },
    { anonymousName: 'Ray (Senior)', role: 'SPECIALIST', rank: 'B', skillLevel: 1.2, balanceFlow: 1500, balanceStock: 300, evaluationScore: 75.2, skills: JSON.stringify(['Node.js', 'Prisma']) },
    { anonymousName: 'Echo (Junior)', role: 'PLAYER', rank: 'E', skillLevel: 1.0, balanceFlow: 500, balanceStock: 50, evaluationScore: 12.0, skills: JSON.stringify(['UI/UX Design']) }
  ]
  const createdUsers = []
  for (const u of users) {
    const user = await prisma.user.create({ data: u })
    createdUsers.push(user)
  }

  // 3. Pre-defined Tasks with Complexity Matrix
  const tasks = [
    {
      title: 'Neural Wallet Core Refactoring',
      description: 'Major refactor of the core transaction logic to improve security and efficiency. Required $D$ is high.',
      reward: 1200,
      expectedHours: 40,
      outputs: 5,
      branches: 12,
      skillCount: 4,
      externalCount: 2,
      requiredSkill: 1.8,
      tags: JSON.stringify(['Node.js', 'System Architecture']),
      requesterId: createdUsers[0].id, // Lumi
      position: 'SPECIALIST',
      status: 'OPEN'
    },
    {
      title: 'Marketing Automation Strategy',
      description: 'Create a detailed strategy for automating internal marketing flows across channels.',
      reward: 800,
      expectedHours: 16,
      outputs: 2,
      branches: 3,
      skillCount: 2,
      externalCount: 1,
      requiredSkill: 1.4,
      tags: JSON.stringify(['Strategy Planning']),
      requesterId: createdUsers[1].id, // Nova
      position: 'MANAGER',
      status: 'OPEN'
    },
    {
      title: 'UI Component Library Cleanup',
      description: 'Basic refactoring of existing UI components to follow new design system rules.',
      reward: 350,
      expectedHours: 8,
      outputs: 1,
      branches: 1,
      skillCount: 1,
      externalCount: 0,
      requiredSkill: 1.0,
      tags: JSON.stringify(['Next.js', 'UI/UX Design']),
      requesterId: createdUsers[2].id, // Ray
      position: 'GENERAL',
      status: 'OPEN'
    }
  ]

  for (const t of tasks) {
    await prisma.task.create({ data: t as any })
  }

  console.log('--- Simulation Data Synchronized Successfully ---')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
