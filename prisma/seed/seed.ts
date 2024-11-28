import { PrismaClient } from '@prisma/client'
import { ISeed } from './models/interface/iseed-model'
import { SeedCourses } from './models/seed-courses'
import { SeedIntelligenceTypes } from './models/seed-intelligenceTypes'
import { SeedQuestions } from './models/seed-questions'
import { SeedUsers } from './models/seed-users'

class Seed {
  async mockingDatabase(prisma: PrismaClient, seed: ISeed) {
    await seed.mocking(prisma)
  }
}

const prisma = new PrismaClient()

async function main() {
  const worker = new Seed()

  try {
    console.log('Starting workerCourses mocking...')
    await worker.mockingDatabase(prisma, new SeedCourses())
    console.log('Finished workerCourses mocking.')

    console.log('Starting workerUsers mocking...')
    await worker.mockingDatabase(prisma, new SeedUsers())
    console.log('Finished workerUsers mocking.')

    console.log('Starting workerIntelligence mocking...')
    await worker.mockingDatabase(prisma, new SeedIntelligenceTypes())
    console.log('Finished workerIntelligence mocking.')

    console.log('Starting workerQuestions mocking...')
    await worker.mockingDatabase(prisma, new SeedQuestions())
    console.log('Finished workerQuestions mocking.')
  } catch (error) {
    console.error('Error during seeding:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
