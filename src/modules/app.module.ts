import { envSchema } from '@/env'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { AdmRoleRoute } from '@/controllers/adm-role-route.controller'
import { AppController } from '@/controllers/app.controller'
import { AuthController } from '@/controllers/auth.controller'
import { TokenRoute } from '@/controllers/token-route.controller'
import { UserRoleRoute } from '@/controllers/user-role-route.controller'

import { PrismaService } from '@/persistence/prisma/prisma.service'
import { AppService } from '@/services/app.service'

import { EmailController } from '@/controllers/email.controller'
import { EmailService } from '@/services/email.service'
import { MailService } from '@/services/mail.service'
import { AccountsModule } from './accounts.module'
import { AuthModule } from './auth.module'
import { CoursesModule } from './courses.module'
import { IntelligenceTypesModule } from './intelligence-types.module'
import { QuestionsModule } from './questions.module'
import { TestResultsModule } from './test-results.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule,
    AccountsModule,
    IntelligenceTypesModule,
    QuestionsModule,
    CoursesModule,
    TestResultsModule,
  ],
  controllers: [
    AppController,
    AuthController,
    EmailController,
    TokenRoute,
    UserRoleRoute,
    AdmRoleRoute,
  ],
  providers: [AppService, PrismaService, MailService, EmailService],
})
export class AppModule {}
