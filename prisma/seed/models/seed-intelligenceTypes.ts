import { ConflictException } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { ISeed } from './interface/iseed-model'

const pathJsonCourses = '../resources/entities/json/intelligenceTypes.json'

export class SeedIntelligenceTypes implements ISeed {
  async mocking(prisma: PrismaClient) {
    const intelligenceTypes = this.fetchingIntelligenceTypes()

    for (const intType of intelligenceTypes) {
      const intCourses = intType.courses.map((course: { name: string }) =>
        this.normalize_name(course.name),
      )

      console.log('INTELLIGENCE TYPE ', intType.name)
      console.log('INTELLIGENCE TYPE COURSES ', intType.courses)

      await this.createIntelligenceTypes(
        prisma,
        intType.name,
        intType.description,
        { courses: intCourses },
      )
    }
  }

  private fetchingIntelligenceTypes() {
    let intTypesFile
    try {
      intTypesFile = require(pathJsonCourses)
    } catch (error) {
      throw new Error('Erro ao carregar arquivo de inteligências')
    }
    return intTypesFile
  }

  private async createIntelligenceTypes(
    prisma: PrismaClient,
    intelligenceTypeName: string,
    intelligenceTypeDescription: string,
    intelligenceTypeCourses: { courses: string[] },
  ) {
    const existingIntelligenceType = await prisma.intelligenceType.findFirst({
      where: {
        name: intelligenceTypeName,
      },
    })

    if (existingIntelligenceType) {
      throw new ConflictException('Tipo de Inteligência já cadastrado!')
    }

    const existingCourses = await prisma.course.findMany({
      where: {
        name: {
          in: intelligenceTypeCourses.courses,
        },
      },
    })
    console.log('COURSES FOUND ', existingCourses)

    if (intelligenceTypeDescription.length > 200) {
      throw new Error('A descrição não pode ter mais de 200 caracteres')
    }

    await prisma.intelligenceType.create({
      data: {
        description: intelligenceTypeDescription,
        name: this.normalize_name(intelligenceTypeName),
        course: {
          connect: existingCourses.map((course) => ({
            id: course.id,
          })),
        },
      },
    })
    console.log('INTELLIGENCE TYPE CREATED ', intelligenceTypeName)
  }

  private normalize_name(name: string) {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9 _-]/g, '')
      .replace(/ /g, '-')
      .toUpperCase()
  }
}
