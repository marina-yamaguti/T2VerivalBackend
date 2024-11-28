import { TokenPayload } from "@/auth/jwt.strategy"
import { PrismaService } from "@/persistence/prisma/prisma.service"
import { Injectable, NotFoundException } from "@nestjs/common"


@Injectable()
export class EmailService {
  constructor(private prisma: PrismaService) {}

  async getEmail(user: TokenPayload){
    const existingUser = await this.prisma.user.findUnique({
        where: {
          id: user.sub,
        },
    })

    if (!existingUser) {
        throw new NotFoundException('Usuário não encontrado!')
    }

    const userEmail = existingUser.email
    return userEmail
  }
}