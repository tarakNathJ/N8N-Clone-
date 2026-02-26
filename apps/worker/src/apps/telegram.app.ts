

import { config } from "dotenv";
import { prisma, schemaType } from "@master/database";
import TelegramBot, { type ConstructorOptions } from "node-telegram-bot-api";
import fs from "fs";
import path from "path";
import { aws_s3_service_provider } from "../utils/aws_s3.js";

config();


const BOT_OPTIONS: ConstructorOptions = {
  // @ts-ignore
  agentOptions: {
    family: 4, 
  } as any,
};

class send_message_on_telegram_bot {
  private async send_message(
    token: string,
    chat_id: number,
    message: object
  ): Promise<boolean> {
    const bot = new TelegramBot(token, BOT_OPTIONS);
    try {
      const result = await bot.sendMessage(chat_id, JSON.stringify(message));
      if (!result) {
        throw new Error("Telegram sendMessage returned falsy result");
      }
      return true;
    } catch (error: any) {
      console.error("Telegram send_message error:", error.message);
      throw new Error(error.message);
    }
  }

  private async send_file_to_telegram(
    token: string,
    chat_id: number,
    messages: { message: string; file_name: string }
  ): Promise<boolean> {
    const { message: caption, file_name } = messages;

    const downloaded_path = await new aws_s3_service_provider().download_file(file_name);

    if (
      !downloaded_path ||
      typeof downloaded_path !== "string" ||
      !fs.existsSync(downloaded_path)
    ) {
      console.error("Telegram File not found after download:", downloaded_path);
      return false;
    }

    const bot = new TelegramBot(token, BOT_OPTIONS);
    try {
      const fileStream = fs.createReadStream(path.resolve(downloaded_path));
      await bot.sendDocument(chat_id, fileStream, {
        caption,
        // @ts-ignore
        contentType: "application/octet-stream",
      });
      return true;
    } finally {
   
      fs.unlink(downloaded_path, (err) => {
        if (err) console.error("[Telegram] Failed to delete temp file:", err.message);
        else console.log("[Telegram] Temp file deleted:", downloaded_path);
      });
    }
  }

  private async send_email_template(
    token: string,
    chat_id: number,
    message: { resever_email_datas: number }
  ): Promise<boolean> {
    const email_template = await prisma.mail_template.findFirst({
      where: {
        reseve_email_validator_id: message.resever_email_datas,
      },
      select: {
        template: true,
      },
    });

    if (!email_template) {
      throw new Error("Email template not found in database");
    }

    await this.send_message(token, chat_id, email_template.template as object);

  
    await prisma.$transaction(async (ts) => {
      const updated_validator = await ts.reseve_email_validator.update({
        where: { id: message.resever_email_datas },
        data: {
          status: schemaType.working_status.SUCCESS,
          update_at: new Date(),
        },
        select: { working_step_validator_id: true },
      });

      await ts.working_step_validator.update({
        where: { id: updated_validator.working_step_validator_id },
        data: {
          status: schemaType.step_validation_status.DONE,
          update_at: new Date(),
        },
      });
    });

    return true;
  }

  public async telegram_init_state(
    token: string,
    chat_id: number,
    message: object
  ): Promise<boolean> {
    const msg = message as any;

    if (msg.resever_email_datas) {
      return await this.send_email_template(token, chat_id, msg);
    }

  
    if (msg.file_name) {
      return await this.send_file_to_telegram(token, chat_id, msg);
    }

    return await this.send_message(token, chat_id, message);
  }
}

export { send_message_on_telegram_bot };