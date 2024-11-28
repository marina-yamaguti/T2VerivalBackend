import { PrismaService } from '@/persistence/prisma/prisma.service'
import { MailService } from '@/services/mail.service'
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare, hash } from 'bcryptjs'
import { z } from 'zod'
import { ZodValidationPipe } from '../commons/pipes/zod-validation-pipe'

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

const forgotPasswordBodySchema = z.object({
  email: z.string().email(),
})

type ForgotPasswordBodySchema = z.infer<typeof forgotPasswordBodySchema>

const changePasswordBodySchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
})

type ChangePasswordBodySchema = z.infer<typeof changePasswordBodySchema>
@Controller('/login')
export class AuthController {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async handle(@Body() body: AuthenticateBodySchema) {
    const { email, password } = body

    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas!')
    }

    const validatePassword = await compare(password, user.password)

    if (!validatePassword) {
      throw new UnauthorizedException('Credenciais inválidas!')
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
    })

    return { access_token: accessToken, user_role: user.role }
  }

  @Post('/forgot-password')
  async forgotPassword(@Body(new ZodValidationPipe(forgotPasswordBodySchema)) body: ForgotPasswordBodySchema) {
    const { email } = body

    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas!')
    }

    const token = this.jwtService.sign({ sub: user.id }, { expiresIn: '1h' })
    await this.mailService.sendPasswordResetEmail(email, token)
  }

  @Put('/reset-password/:token')
  async resetPassword(
    @Body(new ZodValidationPipe(changePasswordBodySchema)) body: ChangePasswordBodySchema,
    @Param('token') token: string,
  ) {
    const userIdFromToken = this.jwtService.decode(token)

    const user = await this.prisma.user.findUnique({
      where: { id: userIdFromToken.sub },
    })

    if (!user) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND)
    }

    const { password, confirmPassword } = body
    if (password !== confirmPassword) {
      throw new HttpException('Senhas não conferem', HttpStatus.BAD_REQUEST)
    }

    const encryptedPassword = await hash(password, 8)

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: encryptedPassword },
    })

    return { message: 'Senha redefinida com sucesso' }
  }
}
