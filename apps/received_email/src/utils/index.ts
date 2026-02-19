import { Kafka, type Producer } from "kafkajs";

let producer: Producer;

async function init_kafka_producer(): Promise<Producer> {
  if (producer) return producer;
  const clientId = process.env.KAFKA_CLIENT_ID;
  const brokers = process.env.KAFKA_BROKERS;

  if (!clientId || !brokers) {
    console.error(" invalid Kafka environment variables");
    process.exit(1);
  }

  const kafka = new Kafka({
    clientId: clientId,
    brokers: [brokers],
  });
  producer = kafka.producer();

  return producer;
}

export { init_kafka_producer };
