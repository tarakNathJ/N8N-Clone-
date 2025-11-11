import { prisma, schemaType } from "@master/database";
import { Kafka, type Producer } from "kafkajs";
import { config } from "dotenv";

config();

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

const process_all_data = async () => {
  const chack_all_process = await prisma.out_box_step_run.findMany({
    where: {},
    take: 5,
  
  });

  let get_producer: Producer;
  const topic = process.env.KAFKA_TOPIC;
    // @ts-ignore
  if (chack_all_process.length !== 0 || !topic) {
    get_producer = await init_kafka_producer();
    get_producer.connect();
  }
  // @ts-ignore
  chack_all_process.map((data: any) => {
    get_producer.send({
      // @ts-ignore
      topic: topic,
      messages: [
        {
            // @ts-ignore
          value: JSON.stringify({
            type:"MESSAGE_FROM_PROECSSOR",
            run:data,
            stage:1
          }),
        },
      ],
    });
  });

  await prisma.out_box_step_run.deleteMany({
    where:{
        id:{
            // @ts-ignore
            in:chack_all_process.map((data:any)=>data.id)
        }
    }
  })

  await new Promise((resolve, reject) => setTimeout(resolve, 10000));


};


process_all_data()