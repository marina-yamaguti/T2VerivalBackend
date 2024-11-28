import { PrismaModule } from "@/persistence/prisma/prisma.module";
import { MailService } from "@/services/mail.service";
import { Module } from "@nestjs/common";

@Module({
  providers: [MailService],
  imports: [PrismaModule],
  exports: [MailService],
})
export class MailModule {}
