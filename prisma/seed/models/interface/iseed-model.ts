import { PrismaClient } from '@prisma/client'

export interface ISeed {
  mocking(prisma: PrismaClient)
}
