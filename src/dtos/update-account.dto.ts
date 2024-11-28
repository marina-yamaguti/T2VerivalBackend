import { z } from 'zod'
import { CreateAccountDto } from './create-account.dto'

export const UpdateAccountDto = CreateAccountDto

export type UpdateAccountDtoSchema = z.infer<typeof UpdateAccountDto>
