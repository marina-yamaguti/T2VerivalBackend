import { CreateIntelligenceTypeDtoSchema } from '@/dtos/create-intelligence-type.dto'
import { PrismaService } from '@/persistence/prisma/prisma.service'
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

@Injectable()
export class IntelligenceTypesService {
  constructor(private prisma: PrismaService) {}

  normalize_name(name) {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9 _-]/g, '')
      .replace(/ /g, '-')
      .toUpperCase()
  }

  async create(body: CreateIntelligenceTypeDtoSchema) {
    const { description, name, courses } = body

    const existingIntelligenceType =
      await this.prisma.intelligenceType.findFirst({
        where: {
          name,
        },
      })

    if (existingIntelligenceType) {
      throw new ConflictException('Tipo de Inteligência já cadastrado!')
    }

    const courseNames =
      courses?.map((course) => this.normalize_name(course.name)) ?? []

    const existingCourses = await this.prisma.course.findMany({
      where: {
        name: {
          in: courseNames,
        },
      },
    })

    if (existingCourses.length !== courseNames.length) {
      throw new NotFoundException('Um ou mais tipos de curso não existem')
    }

    if (description.length > 200) {
      throw new Error('A descrição não pode ter mais de 200 caracteres')
    }

    await this.prisma.intelligenceType.create({
      data: {
        description,
        name: this.normalize_name(name),
        course: {
          connect: existingCourses.map((course) => ({
            id: course.id,
          })),
        },
      },
    })
  }
}
