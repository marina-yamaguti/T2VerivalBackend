import { z } from 'zod'

export const CreateAccountDto = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: 'A senha deve ter pelo menos 8 caracteres' }),
  birthdate: z.string().nullable(),
  role: z.enum(['USER', 'ADMIN']),
  education: z
    .enum([
      'FUNDAMENTAL',
      'MEDIO',
      'GRADUACAO',
      'POSGRADUACAO',
      'MESTRADO',
      'DOUTORADO',
    ])
    .nullable(),
  gender: z.enum(['HOMEM', 'MULHER', 'OUTRO']).nullable(),
})

export type CreateAccountDtoSchema = z.infer<typeof CreateAccountDto>
