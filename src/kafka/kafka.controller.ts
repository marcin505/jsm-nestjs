import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices'; // <-- Upewnij się, że jest dokładnie tak

@Controller()
export class KafkaController {
  @EventPattern('user.role.updated')
  handleUserRoleUpdated(@Payload() data: any) {
    console.log('--- Odebrano zdarzenie z Apache Kafka ---');
    console.log(`Użytkownik: ${data.userId} ma nową rolę: ${data.newRole}`);
  }
}
