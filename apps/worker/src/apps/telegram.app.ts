import { config } from "dotenv";
import { prisma, schemaType } from "@master/database";
import TelegramBot, { type ConstructorOptions } from "node-telegram-bot-api";
import fs from "fs";
import path from "path";
import { aws_s3_service_provider } from "../utils/aws_s3.js";


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

  private async send_file_to_telegram(
    token: string,
    chat_id: number,
    messages: object
  ) {
    try {
      const { message: caption } = messages as {
        message: string;
        file_name: string;
      };
      const file_name = await new aws_s3_service_provider().download_file(
        (messages as { file_name: string }).file_name
      );

      if (
        !file_name ||
        typeof file_name !== "string" ||
        !fs.existsSync(file_name)
      ) {
        return false;
      }

      const requestOption = {
        agentOptions: {
          family: 4,
        },
      };

      const bot = new TelegramBot(token, requestOption as ConstructorOptions);
      const fileStream = fs.createReadStream(path.resolve(file_name));
      await bot.sendDocument(chat_id, fileStream, {
        caption,
        // @ts-ignore
        contentType: "application/octet-stream",
      });

      fs.unlink(file_name, () => {
        console.log("file delete success fully");
      });
      return true;
    } catch (error: any) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  private async send_email_template(
    token: string,
    chat_id: number,
    message: object
  ) {
    try {
      // fetch email template  for db
      const get_email_template = await prisma.mail_template.findFirst({
        where: {
          // @ts-ignore
          reseve_email_validator_id: message.resever_email_datas,
        },
        select: {
          template: true,
        },
      });

      if (!get_email_template) {
        console.log("email template not found");
        throw new Error("email template not found");
      }

      const status_for_send_message = await this.send_message(
        token,
        chat_id,
        get_email_template.template as object
      );
      if (!status_for_send_message) {
        console.log("email template send failed");
        throw new Error("email template send failed");
      }

      const complete_email_template_validation = await prisma.$transaction(
        async (ts) => {
          const reseve_email_validator_id_status_update =
            await ts.reseve_email_validator.update({
              where: {
                // @ts-ignore
                id: message.resever_email_datas,
              },
              data: {
                // @ts-ignore
                status: schemaType.working_status.SUCCESS,
                update_at: new Date(),
              },
              select: {
                working_step_validator_id: true,
              },
            });
          await ts.working_step_validator.update({
            where: {
              id: reseve_email_validator_id_status_update.working_step_validator_id,
            },
            data: {
              status: schemaType.step_validation_status.DONE,
              update_at: new Date(),
            },
          });

          return true;
        }
      );

      return complete_email_template_validation ? true : false;
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
    try {
      let status = false;
      
      // @ts-ignore
      if(message.resever_email_datas ){
        // console.log("receive email pic this :",message);
        status = await this.send_email_template(token, chat_id, message);
      }else{
        status = await this.send_message(token, chat_id, message);
      }
      // switch (message) {
      //   case ("file_name" in message) as unknown as object:
      //     status = await this.send_file_to_telegram(token, chat_id, message);
      //     break;
      //   case (message.hasOwnProperty("resever_email_datas")) as unknown as any:
      //     console.log("receive email pic this :",message);
      //     status = await this.send_email_template(token, chat_id, message);
      //     break;
      //   default:
      //     status = await this.send_message(token, chat_id, message);
      //     break;
      // }

      return status;
    } catch (error: any) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }
}

export { send_message_on_telegram_bot };
