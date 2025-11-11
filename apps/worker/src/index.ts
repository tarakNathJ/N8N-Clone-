import { Kafka, type Consumer, type Producer } from "kafkajs";

let producer: Producer;
let consumer: Consumer;
const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID,
  //@ts-ignore
  brokers: [process.env.KAFKA_BROCKER],
});

const init_producer = () => {
  if (producer) return producer;

  producer = kafka.producer();
  return producer;
};

const init_consumer = async (groupId = "default"): Promise<Consumer> => {
  if (consumer) return consumer;
  consumer = kafka.consumer({
    groupId: groupId,
  });

  return consumer;
};

async function work_executer() {
  try {
    // chack topic  are exist ot not
    const topic = process.env.KAFKA_TOPIC;
    if (!topic) {
      console.error("env variable not exit , ");
      process.exit(1);
    }

    // get  consumer
    const get_consumer = await init_consumer("worker");

    // connect consumer
    get_consumer?.connect().catch((error: any) => {
      console.error(error.message);
      process.exit(1);
    });


    await get_consumer.subscribe({
      topic: topic,
      fromBeginning: true,
    });

    get_consumer.run({
      autoCommit: true,
      eachMessage: async ({ topic, partition, message }) => {
        console.log("value of  :-   ",message.value);

      },
    });
  } catch (error: any) {
    console.error(error);
    process.exit(1);
  }
}
work_executer();
