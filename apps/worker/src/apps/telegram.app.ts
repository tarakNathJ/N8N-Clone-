import { config } from "dotenv";
import { prisma } from "@master/database";
import TelegramBot, { type ConstructorOptions } from "node-telegram-bot-api";
import fs from 'fs';
import path from "path";
import {aws_s3_service_provider}  from "../utils/aws_s3.js"

config();

class send_message_on_telegram_bot {
  private async send_message(
    token: string,
    chat_id: number,
    message: object
  ): Promise<boolean> {
    try {
      const reqest_option = {
        agentOptions: {
          family: 4,
        },
      };

      const bot = new TelegramBot(token, reqest_option as ConstructorOptions);
      const result = await bot.sendMessage(chat_id, JSON.stringify(message));
      if (!result) {
        console.log("telegram message failed");
        throw new Error("telegram message failed");
      }


      return true;
    } catch (error: any) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  private async send_file_to_telegram( token: string, chat_id: number, messages: object) {
    try {
        
        const {message :caption }  = messages as {message: string, file_name: string};
        const file_name = await new aws_s3_service_provider().download_file((messages as {file_name: string}).file_name);

        if (!file_name || typeof(file_name) !== "string" || !fs.existsSync(file_name) ){
            return false
        }

        const requestOption = {
            agentOptions: {
                family: 4,
            },
        };
        
        const bot = new TelegramBot(token, requestOption as ConstructorOptions);
        const fileStream = fs.createReadStream(path.resolve(file_name));
        await bot.sendDocument(chat_id, fileStream,{
            caption,
            // @ts-ignore
            contentType: "application/octet-stream",

        })

    fs.unlink(file_name, () => {
      console.log("file delete success fully");
    });
    return true
    } catch (error: any) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  public async telegram_init_state(
    token: string,
    chat_id: number,
    message: object
  ) {
    switch (message) {
      case ("file_name" in message) as unknown as object:
        await this.send_file_to_telegram(token, chat_id, message);
        break;
      case ("resever_email_datas" in message) as unknown as object:
        break;
      default:
        await this.send_message(token, chat_id, message);
        break;
    }
  }
}

export { send_message_on_telegram_bot };
