import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { Env } from './env'
import { AppModule } from './modules/app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true })

  const configService: ConfigService<Env, true> = app.get(ConfigService)
  const port = configService.get('PORT', { infer: true })

  await app.listen(port)
}

bootstrap()
