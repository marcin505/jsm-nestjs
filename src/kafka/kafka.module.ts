import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config'; // <-- Importujemy Config z NestJS
import { KafkaService } from './kafka.service';
import { KafkaController } from './kafka.controller';

@Module({
  imports: [
    ConfigModule, // Upewnij się, że ConfigModule jest załadowany globalnie
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_CLIENT',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'nest-api',
              // Dynamicznie pobieramy broker URL ze zmiennej KAFKA_BROKER w pliku .env
              brokers: [configService.getOrThrow<string>('KAFKA_BROKER')],
            },
            consumer: {
              groupId: 'nest-mcp-consumer',
              allowAutoTopicCreation: true,
            },
            producer: {
              allowAutoTopicCreation: true,
            },
          },
        }),
      },
    ]),
  ],
  providers: [KafkaService],
  controllers: [KafkaController],
  exports: [KafkaService],
})
export class KafkaModule {}
