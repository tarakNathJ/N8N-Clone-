import { Kafka, type Consumer, type Producer } from "kafkajs";
import { database_service_provider } from "./utils/db_operation.js";
import { mail_sender } from "./apps/gmail.app.js";
import dotenv from "dotenv";
import { send_message_on_telegram_bot } from "./apps/telegram.app.js";
import { request_transfer_on_your_right_direction } from "./utils/routing_all_request.js";
import type {
  object_type_for_email,
  object_type_for_telegram,
  receive_email_type,
} from "./types/index.js";

import { create_job_metrics } from "@repo/handler";

dotenv.config();

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
    ///////////////////////////////////// init Prometheus metrics/////////////////////////////
    const { job_counter, job_duration, push } = create_job_metrics("worker");
    //////////////////////////////////////////////////////////////////////////////////////////
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
        if (!message.value) {
          return;
        }

        // collect Prometheus metrics
        ////////////////////// start metrics ///////////////////////////////
        const end = job_duration.startTimer();
        job_counter.inc();
        //////////////////////////////////////////////////////////////////

        const data = JSON.parse(message.value?.toString());

        await new Promise((resolve, reject) => setTimeout(resolve, 6000));
        // console.log(data);
        if (data.type == "MESSAGE_FROM_PROECSSOR") {
          // chack in our data base data are exist or not
          const db_data = await new database_service_provider().getdata(
            data.run.stepes_run_id,
            data.stage
          );

          if (
            !db_data ||
            db_data.length == 0 ||
            !db_data.get_step_find_by_id_and_index
          ) {
            return;
          }

          let template:
            | object_type_for_email
            | object_type_for_telegram
            | receive_email_type
            | null = null;

          // chack which type of work
          switch (db_data.get_step_find_by_id_and_index.name) {
            case "gmail":
              const email_template = {
                sender_email:
                  db_data.get_step_find_by_id_and_index.meta_data.email,
                app_password:
                  db_data.get_step_find_by_id_and_index.meta_data.app_password,
                message:
                  db_data.get_step_find_by_id_and_index.meta_data.message,
                receiver_email: db_data.get_steprun_table?.meta_data.email,
                subject: " n8n ",
                stepes_run_id: data.run.stepes_run_id,
                stage: data.stage,
              };
              template = email_template;
              break;
            case "telegram":
              let meta_data = db_data.get_steprun_table.meta_data;
              if (data.run.reseve_email_validator) {
                console.log(data.run.reseve_email_validator);
                meta_data = {
                  resever_email_datas: data.run.reseve_email_validator[0].id,
                };
              }
              const telegram_template = {
                token: db_data.get_step_find_by_id_and_index.meta_data.token,
                chat_id: db_data.get_step_find_by_id_and_index.meta_data.chatId,
                message: meta_data,
              };
              template = telegram_template;
              break;
            case "receive_email":
              const receive_email_template = {
                stepes_run_id: data.run.stepes_run_id,
              };
              template = receive_email_template;

              break;
            default:
              break;
          }

          if (!template) {
            return;
          }

          await new request_transfer_on_your_right_direction().routing_all_request_on_right_direction(
            db_data.get_step_find_by_id_and_index.name,
            //@ts-ignore
            template
          );

          if (db_data.get_step_find_by_id_and_index.name == "receive_email")
            return;
          // produce new message for next->target
          const get_producer = init_producer();
          await get_producer.connect();
          await get_producer.send({
            topic: process.env.KAFKA_TOPIC as string,
            messages: [
              {
                value: JSON.stringify({
                  type: "MESSAGE_FROM_PROECSSOR",
                  run: data.run,
                  stage: data.stage + 1,
                }),
              },
            ],
          });
        }
        ////////////////////// end metrics ///////////////////////////////
        end();
        await push();
        ///////////////////////////////////////////////////////
        await consumer.commitOffsets([
          {
            topic,
            partition,
            offset: (parseInt(message.offset) + 1).toString(),
          },
        ]);
        await new Promise((resolve, reject) => setTimeout(resolve, 4000));
      },
    });
  } catch (error: any) {
    console.error(error);
    process.exit(1);
  }
}


work_executer();
