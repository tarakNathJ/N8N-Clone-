import cron from "node-cron";
import { receive_email } from "./utils/index.js";
import { Kafka, type Producer } from "kafkajs";
import { prisma } from "@master/database";
import dotenv from "dotenv";
import { create_job_metrics } from "@repo/handler";

dotenv.config();

let producer: Producer;
// init kafka producer
async function init_kafka() {
  try {
    if (producer) return producer;
    const client_id = process.env.KAFKA_CLIENT_ID;
    const brokers = process.env.KAFKA_BROKER;

    if (!client_id || !brokers) {
      throw new Error("Missing required environment variables");
    }

    const kafka = new Kafka({
      clientId: client_id,
      brokers: [brokers],
    });

    producer = kafka.producer();
    await producer.connect();
  } catch (error: any) {
    console.log(error.message);
    throw new Error(error.message);
  }
}

// cron scheduler
const cron_task = cron.schedule(
  "*/2 * * * *",
  async () => {
    await init_cron_worker();
  },
  { scheduled: false } as any
);

// init function to all task
async function init_cron_worker() {
  try {
    cron_task.stop();

    //////////////////////  init Prometheus &&  start  collect  metrics ///////////////////////////////
    const { job_counter, job_duration, push } = create_job_metrics("cron_job");
    const end = job_duration.startTimer();
    job_counter.inc();
    //////////////////////////////////////////////////////////////////

    const get_all_receive_emai_step = await prisma.step.findMany({
      where: {
        name: "receive_email",
      },
      select: {
        meta_data: true,
        index: true,
      },
    });

    await new Promise((resolve, reject) => setTimeout(resolve, 1000));

    const get_producer = await init_kafka().catch((error) => {
      console.log(error.message);
      return null;
    });
    if (!get_producer) {
      cron_task.start();
      return;
    }

    for (const key of get_all_receive_emai_step) {
      const data = await new receive_email().run(
        (key.meta_data as any).app_password,
        (key.meta_data as any).email
      );
      get_producer.send({
        topic: process.env.KAFKA_TOPIC as string,
        messages: data.map((item) => ({
          value: JSON.stringify({
            type: "MESSAGE_FROM_PROECSSOR",
            run: {
              stepes_run_id: item.stepes_run_id,
              create_at: item.create_at,
              update_at: item.update_at,
              reseve_email_validator: item.reseve_email_validator,
            },
            stage: key.index + 1,
          }),
        })),
      });
    }
    console.log("cron round completed successfully");
    ////////////////////// end metrics ///////////////////////////////
    end();
    await push();
    /////////////////////////////////////////////////////// 

    await new Promise((resolve, reject) => setTimeout(resolve, 4000));
    cron_task.start();
    return true;
  } catch (error: any) {
    console.log(error.message);
    throw new Error(error.message);
  }
}

cron_task.start();
