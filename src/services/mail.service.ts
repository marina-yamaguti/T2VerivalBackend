import { Env } from '@/env'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter
  constructor(private configService: ConfigService<Env, true>) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      auth: {
        user: this.configService.get('MAILER_USER', { infer: true }),
        pass: this.configService.get('MAILER_PASS', { infer: true }),
      },
    })
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const resetLink = `http://polymathech.com.br:8080/changePassword?token=${token}`

    const mailOptions = {
      from: 'Backend',
      to,
      subject: 'Password Reset',
      html: `<p>Você requisitou uma mudança de senha.</p><a href="${resetLink}">Clique aqui para redefinir a senha</a>`,
    }

    await this.transporter.sendMail(mailOptions)
  }

  async sendResultMail(to: string, intelType: string | undefined) {
    const mailOptions = {
      from: 'Backend',
      to,
      subject: 'Password Reset',
      html: `<p>Seu resultado no teste Polymathech: ${intelType}</p>`,
    }

    await this.transporter.sendMail(mailOptions)
  }
}
