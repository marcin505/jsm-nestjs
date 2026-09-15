import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { KafkaModule } from '../kafka/kafka.module';
import { PrismaService } from '../prisma/prisma.service'; // <-- Importujemy bezpośrednio SAM SERWIS

@Module({
  imports: [
    KafkaModule, // Pozostawiamy tylko moduł Kafki
  ],
  controllers: [UserController],
  providers: [
    UserService,
    PrismaService, // <-- KLUCZOWA LINIA: Dostarczamy PrismaService do kontekstu tego modułu
  ],
})
export class UserModule {}
