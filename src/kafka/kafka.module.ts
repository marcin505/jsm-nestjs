import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaService } from './kafka.service';
import { KafkaController } from './kafka.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_CLIENT',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'nest-api',
            brokers: ['kafka:9092'],
          },
          consumer: {
            groupId: 'nest-mcp-consumer',
            allowAutoTopicCreation: true, // Zezwolenie na auto-tworzenie dla konsumenta
          },
          producer: {
            allowAutoTopicCreation: true, // <-- POPRAWIONY KLUCZ: Zamiast 'run' wpisujemy 'producer'
          },
        },
      },
    ]),
  ],
  providers: [KafkaService],
  controllers: [KafkaController],
  exports: [KafkaService],
})
export class KafkaModule {}
