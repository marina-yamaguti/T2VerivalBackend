import { JwtStrategy } from "@/auth/jwt.strategy";
import { TestResultsController } from "@/controllers/test-results.controller";
import { PrismaModule } from "@/persistence/prisma/prisma.module";
import { TestResultsService } from "@/services/test-results.service";
import { Module } from "@nestjs/common";
import { MailModule } from "./mail.module";

@Module({
  controllers: [TestResultsController],
  providers: [TestResultsService, JwtStrategy],
  imports: [PrismaModule, MailModule],
})
export class TestResultsModule {}
