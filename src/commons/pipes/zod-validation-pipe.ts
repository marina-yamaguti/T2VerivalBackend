import { BadRequestException } from '@nestjs/common'
import { ZodError, ZodSchema } from 'zod'
import { fromZodError } from 'zod-validation-error'

export class ZodValidationPipe {
  constructor(private schema: ZodSchema) {}

  transform(value) {
    try {
      const parsedValue = this.schema.parse(value)
      return parsedValue
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          errors: fromZodError(error),
          message: 'Falha na validação',
          statusCode: 400,
        })
      }

      throw new BadRequestException('Falha na validação')
    }
  }
}
