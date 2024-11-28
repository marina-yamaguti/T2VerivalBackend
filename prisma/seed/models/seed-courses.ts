import { ConflictException } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { ISeed } from './interface/iseed-model'

const pathJsonCourses = path.resolve(
  __dirname,
  '../resources/entities/json/mocked-courses.json',
)

export class SeedCourses implements ISeed {
  async mocking(prisma: PrismaClient) {
    const coursesNamesList = this.fetchingCourses()

    for (const course of coursesNamesList) {
      const courseName: string = course[0]
      const courseDescription: string = course[1]
      await this.createCourse(prisma, courseName, courseDescription)
    }
  }

  private fetchingCourses() {
    let coursesFile
    try {
      coursesFile = JSON.parse(fs.readFileSync(pathJsonCourses, 'utf-8'))
    } catch (error) {
      throw new Error('Erro ao carregar arquivo de cursos')
    }

    const courses: [string, string][] = coursesFile.map(
      (curso: { [key: string]: string }) => Object.entries(curso)[0],
    )
    return courses
  }

  private async createCourse(
    prisma: PrismaClient,
    courseName: string,
    courseDescription: string,
  ) {
    const existingCourse = await prisma.course.findFirst({
      where: {
        name: courseName,
      },
    })

    if (existingCourse) {
      throw new ConflictException('Curso já cadastrado!')
    }

    const course = await prisma.course.create({
      data: {
        name: this.normalize_name(courseName),
        description: courseDescription,
      },
    })
    console.log('COURSE CREATED ', course)
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
