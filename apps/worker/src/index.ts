import { Kafka, type Consumer, type Producer } from "kafkajs";
import { database_service_provider } from "./utils/db_operation.js";
import { handle_incoming_email_webhook } from "./apps/receive_email.js";
import { mail_sender } from "./apps/gmail.app.js";
import { send_message_on_telegram_bot } from "./apps/telegram.app.js";
import { request_transfer_on_your_right_direction } from "./utils/routing_all_request.js";
import type {
  object_type_for_email,
  object_type_for_telegram,
  receive_email_type,
} from "./types/index.js";
import dotenv from "dotenv";

dotenv.config();

const brokers = (
  process.env.KAFKA_BROKERS ||
  process.env.KAFKA_BROKER ||
  "localhost:9092"
)
  .split(",")
  .map((b) => b.trim());

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || "worker",
  brokers,
  retry: {
    initialRetryTime: 300,
    retries: 5,
  },
});

let producer: Producer | null = null;
let consumer: Consumer | null = null;

async function get_or_create_producer(): Promise<Producer> {
  if (producer) return producer;
  producer = kafka.producer();
  await producer.connect();
  console.log("[Kafka] Producer connected");
  return producer;
}

async function get_or_create_consumer(groupId: string): Promise<Consumer> {
  if (consumer) return consumer;
  consumer = kafka.consumer({ groupId });
  return consumer;
}

async function work_executer() {
  const topic = process.env.KAFKA_TOPIC;
  const group_id = process.env.KAFKA_GROUP_ID;

  if (!topic || !group_id) {
    console.error(
      "[Worker] KAFKA_TOPIC and KAFKA_GROUP_ID env vars are required",
    );
    process.exit(1);
  }

  const prod = await get_or_create_producer();

  const cons = await get_or_create_consumer(group_id);

  try {
    await cons.connect();
    console.log("[Kafka] Consumer connected");
  } catch (error: any) {
    console.error("[Kafka] Consumer connection failed:", error.message);
    process.exit(1);
  }

  await cons.subscribe({ topic, fromBeginning: true });

  await cons.run({
    autoCommit: false,
    eachMessage: async ({ topic: msg_topic, partition, message }) => {
      if (!message.value) {
        await cons.commitOffsets([
          {
            topic: msg_topic,
            partition,
            offset: (parseInt(message.offset) + 1).toString(),
          },
        ]);
        return;
      }

      try {
        const data = JSON.parse(message.value.toString());

        if (data.type == "MESSAGE_FROM_PROECSSOR_RECEIVE") {
          const result = await handle_incoming_email_webhook(data);
          await prod.send({
            topic,
            messages: [
              {
                value: JSON.stringify({
                  type: "MESSAGE_FROM_PROECSSOR",
                  run: {
                    stepes_run_id: (result as any)?.step_run_id,
                    reseve_email_validator: (result as any)?.payload,
                  },
                  stage: (result as any)?.step + 1,
                }),
              },
            ],
          });

          await cons.commitOffsets([
            {
              topic: msg_topic,
              partition,
              offset: (parseInt(message.offset) + 1).toString(),
            },
          ]);

          return;
        }

        if (data.type !== "MESSAGE_FROM_PROECSSOR") {
          await cons.commitOffsets([
            {
              topic: msg_topic,
              partition,
              offset: (parseInt(message.offset) + 1).toString(),
            },
          ]);
          return;
        }

        const db_data = await new database_service_provider().getdata(
          data.run.stepes_run_id,
          data.stage,
        );

        if (!db_data || !db_data.get_step_find_by_id_and_index) {
          await cons.commitOffsets([
            {
              topic: msg_topic,
              partition,
              offset: (parseInt(message.offset) + 1).toString(),
            },
          ]);
          return;
        }

        let template:
          | object_type_for_email
          | object_type_for_telegram
          | receive_email_type
          | null = null;

        const step_name = db_data.get_step_find_by_id_and_index.name;
        const step_meta = db_data.get_step_find_by_id_and_index.meta_data;
        const run_meta = db_data.get_steprun_table?.meta_data;

        switch (step_name) {
          case "gmail":
            template = {
              sender_email: step_meta.email,
              app_password: step_meta.app_password,
              message: step_meta.message,
              receiver_email: run_meta.email,
              subject: "n8n",
              stepes_run_id: data.run.stepes_run_id,
              stage: data.stage,
            } as object_type_for_email;
            break;

          case "telegram":
            let meta_data = run_meta;
            if (data.run.reseve_email_validator) {
              meta_data = {
                resever_email_datas: data.run.reseve_email_validator.id,
              };
            }
            template = {
              token: step_meta.token,
              chat_id: step_meta.chatId,
              message: meta_data,
            } as object_type_for_telegram;
            break;

          case "receive_email":
            template = {
              stepes_run_id: data.run.stepes_run_id,
            } as receive_email_type;
            break;

          default:
            console.warn("[Worker] Unknown step name:", step_name);
            break;
        }

        if (!template) {
          await cons.commitOffsets([
            {
              topic: msg_topic,
              partition,
              offset: (parseInt(message.offset) + 1).toString(),
            },
          ]);
          return;
        }

        await new request_transfer_on_your_right_direction().routing_all_request_on_right_direction(
          step_name,
          template as any,
        );

        if (step_name !== "receive_email") {
          await prod.send({
            topic,
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

        await cons.commitOffsets([
          {
            topic: msg_topic,
            partition,
            offset: (parseInt(message.offset) + 1).toString(),
          },
        ]);
      } catch (error: any) {
        console.error("Worker eachMessage error:", error.message);
      }
    },
  });
}

async function shutdown() {
  console.log("Worker Shutting down gracefully");
  try {
    if (consumer) await consumer.disconnect();
    if (producer) await producer.disconnect();
  } catch (e) {}
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

work_executer().catch((error) => {
  console.error("Worker Fatal error:", error);
  process.exit(1);
});
