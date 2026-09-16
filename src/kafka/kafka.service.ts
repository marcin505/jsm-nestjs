import {
  Injectable,
  Inject,
  OnApplicationBootstrap,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Kafka } from 'kafkajs';

@Injectable()
export class KafkaService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private nativeConsumer: any = null;

  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
  ) {}

  async onApplicationBootstrap() {
    try {
      // 1. Łączymy producenta NestJS (do wysyłania przez HTTP)
      await this.kafkaClient.connect();
      this.logger.log('🚀 Z powodzeniem połączono z producentem Apache Kafka');

      // 2. Budujemy silnik kafkajs
      const kafkaJS = new Kafka({
        clientId: 'nest-api-consumer',
        brokers: [process.env.KAFKA_BROKER || 'kafka:9092'], // Pobiera z .env, a w razie braku daje fallbac
      });

      // --- WYMUSZENIE UTWORZENIA TEMATÓW PRZEZ ADMIN API (STANDARD ENTERPRISE) ---
      const admin = kafkaJS.admin();
      await admin.connect();
      this.logger.log('🛠️ Sprawdzanie i weryfikacja tematów na brokerze...');

      const targetTopics = [
        'user.created',
        'user.updated',
        'user.deleted',
        'user.role.updated',
      ];
      const existingTopics = await admin.listTopics();
      const topicsToCreate = targetTopics.filter(
        (topic) => !existingTopics.includes(topic),
      );

      if (topicsToCreate.length > 0) {
        this.logger.log(
          `📝 Tworzenie brakujących tematów w klastrze: ${topicsToCreate.join(', ')}`,
        );
        await admin.createTopics({
          validateOnly: false,
          waitForLeaders: true,
          topics: topicsToCreate.map((topic) => ({
            topic,
            numPartitions: 1,
            replicationFactor: 1,
          })),
        });
      }
      await admin.disconnect();
      // --------------------------------------------------------------------------

      // 3. Dopiero gdy mamy 100% pewności, że tematy istnieją, odpalamy konsumenta
      this.nativeConsumer = kafkaJS.consumer({
        groupId: 'nest-mcp-consumer',
        allowAutoTopicCreation: true,
      });

      this.logger.log(
        'wrapper 🔄 Uruchamianie asynchronicznego konsumenta Kafki...',
      );
      await this.nativeConsumer.connect();

      await this.nativeConsumer.subscribe({
        topic: 'user.created',
        fromBeginning: false,
      });
      await this.nativeConsumer.subscribe({
        topic: 'user.updated',
        fromBeginning: false,
      });
      await this.nativeConsumer.subscribe({
        topic: 'user.deleted',
        fromBeginning: false,
      });

      await this.nativeConsumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          if (!message.value) return;
          const payload = JSON.parse(message.value.toString());
          this.logger.log(
            `--- [KAFKA CONSUMER] Odebrano zdarzenie z tematu: ${topic} ---`,
          );
          this.logger.log(`Payload: ${JSON.stringify(payload)}`);
        },
      });

      this.logger.log(
        '📥 Konsument Kafki jest w 100% aktywny i gotowy na eventy!',
      );
    } catch (error) {
      this.logger.error(
        '❌ Krytyczny błąd podczas inicjalizacji klastra Kafki:',
        error,
      );
    }
  }

  emitEvent(topic: string, payload: any) {
    return this.kafkaClient.emit(topic, JSON.stringify(payload)).subscribe();
  }

  async onModuleDestroy() {
    if (this.nativeConsumer) {
      await this.nativeConsumer.disconnect();
    }
  }
}
