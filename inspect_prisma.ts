import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function test() {
  console.log('--- Inspecting Prisma Client User Model ---')
  try {
    // Just try to see what's in the client
    const fields = Object.keys((prisma as any).user || {})
    console.log('User model keys found:', fields)
    
    // Check if rank exists in the dmmf (metadata)
    const dmmf = (prisma as any)._dmmf
    const userModel = dmmf.modelMap.User
    console.log('User model fields in DMMF:', userModel.fields.map((f: any) => f.name))
  } catch (e) {
    console.error('Inspection failed:', e)
  }
}

test().finally(() => prisma.$disconnect())
