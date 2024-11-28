import { TokenPayload } from '@/auth/jwt.strategy'
import { CreateAccountDtoSchema } from '@/dtos/create-account.dto'
import { PrismaService } from '@/persistence/prisma/prisma.service'
import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common'
import { hash } from 'bcryptjs'

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async create(body: CreateAccountDtoSchema) {
    const { name, email, password, birthdate, role, education, gender } = body

    const userWithSameEmail = await this.prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (userWithSameEmail) {
      throw new ConflictException('Usuário já cadastrado!')
    }

    const encryptedPassword = await hash(password, 8)

    const birthdateToDateTime = birthdate
      ? new Date(birthdate).toISOString()
      : null

    await this.prisma.user.create({
      data: {
        name,
        email,
        password: encryptedPassword,
        birthdate: birthdateToDateTime,
        role,
        education: !education ? null : education,
        gender: !gender ? null : gender,
      },
    })
    const returnBody = { name, email, birthdate, role, education, gender }
    return returnBody
  }

  async getUserEmail(user: TokenPayload) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        id: user.sub,
      },
    })

    if (!existingUser) {
      throw new HttpException('Usuário não encontrado', HttpStatus.BAD_REQUEST)
    }

    return existingUser.email
  }
}
