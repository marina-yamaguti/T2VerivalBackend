import { CreateCourseDtoSchema } from '@/dtos/create-course.dto'
import { PrismaService } from '@/persistence/prisma/prisma.service'
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  normalize_name(name) {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9 _-]/g, '')
      .replace(/ /g, '-')
      .toUpperCase()
  }

  async create(body: CreateCourseDtoSchema) {
    const { name, intelligences, description } = body

    const existingCourse = await this.prisma.course.findFirst({
      where: {
        name,
      },
    })

    if (existingCourse) {
      throw new ConflictException('Curso já cadastrado!')
    }

    const intelligenceNames =
      intelligences?.map((intelligence) =>
        this.normalize_name(intelligence.name),
      ) ?? []

    const existingIntelligences = await this.prisma.intelligenceType.findMany({
      where: {
        name: {
          in: intelligenceNames,
        },
      },
    })

    if (existingIntelligences.length !== intelligenceNames.length) {
      throw new NotFoundException(
        'Um ou mais tipos de inteligência não existem',
      )
    }

    if (description && description.length > 200) {
      throw new Error('A descrição não pode ter mais de 200 caracteres')
    }

    await this.prisma.course.create({
      data: {
        name: this.normalize_name(name),
        description,
        intell_type: {
          connect: existingIntelligences.map((intell) => ({
            id: intell.id,
          })),
        },
      },
    })
  }
}
