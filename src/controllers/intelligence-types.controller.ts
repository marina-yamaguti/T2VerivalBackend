import { Body, Controller, Post } from '@nestjs/common'
import { CreateIntelligenceTypeDtoSchema } from '../dtos/create-intelligence-type.dto'
import { IntelligenceTypesService } from '../services/intelligence-types.service'

@Controller('/intelligence-types')
export class IntelligenceTypesController {
  constructor(
    private readonly intelligenceTypesService: IntelligenceTypesService,
  ) {}

  @Post()
  create(@Body() createIntelligenceTypeDto: CreateIntelligenceTypeDtoSchema) {
    return this.intelligenceTypesService.create(createIntelligenceTypeDto)
  }
}
