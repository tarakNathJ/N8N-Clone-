import { config } from "dotenv";
import { async_handler, api_error } from "@repo/handler";
import { init_kafka_producer } from "../utils/index.js";
import type { Producer } from "kafkajs";

config();

const topic = process.env.KAFKA_TOPIC;
if (!topic) {
  throw new Error("env variable are not exist ");
}

export const handle_email_reply_webhook = async_handler(async (req, res) => {
  const { data } = req.body;
  if (!data) {
    throw new api_error(400, "data are not exist");
  }

    const producer: Producer = await init_kafka_producer();
    await producer.connect();

    producer.send({
      topic: topic,
      messages: [
        {
          value: JSON.stringify({
            type: "MESSAGE_FROM_PROECSSOR_RECEIVE",
            run: data,
          }),
        },
      ],
    });

  return res.status(200).send("OK");
});
