import { prisma, schemaType } from "@master/database";
import imaps from "imap-simple";

type data = {
  email: string;
  message_id: string;
  body: string;
  subject: string;
};
class receive_email {
  private stor_email_data: data[] = [];
  private time: Date = new Date(Date.now() - 3 * 60 * 60 * 1000);

  private cleanEmailBody(raw: any) {
    if (!raw) return "";

    let text = raw.replace(/=([A-Fa-f0-9]{2})/g, (_: any, hex: string) =>
      String.fromCharCode(parseInt(hex, 16))
    );
    text = text.replace(/--[A-Za-z0-9\-=_]+/g, "");
    text = text.replace(/Content-[^\n]+\n?/gi, "");
    text = text.replace(/<\/?[^>]+(>|$)/g, "");

    const splitIndex = text.search(/On\s.*wrote:/i);
    if (splitIndex > -1) text = text.substring(0, splitIndex);

    return text.replace(/\r?\n+/g, "\n").trim();
  }

  private async fetch_all_from_our_gmail() {
    // get resent submit entry
    const privious_runtime = await prisma.cron_worker_counting_table.findFirst({
      orderBy: {
        privious_time: "desc",
      },
      select: {
        privious_time: true,
      },
    });
    if (privious_runtime) {
      this.time = privious_runtime.privious_time;
    }
    return this.time;
  }

  private async get_all_email(
    email: string,
    app_password: string,
    time_duration: Date
  ) {
    try {
      const config = {
        imap: {
          user: email,
          password: app_password,
          host: "imap.gmail.com",
          port: 993,
          tls: true,
          tlsOptions: { rejectUnauthorized: false },
        },
      };
      const connection = await imaps.connect(config);
      await connection.openBox("INBOX");
      const search_criteria = [["SINCE", time_duration.toUTCString()]];
      const fetch_options = { bodies: ["HEADER", "TEXT"], markSeen: false };
      const messages = await connection.search(search_criteria, fetch_options);
      const results = [];

      for (const message of messages) {
        const headerPart = message.parts.find((p: any) => p.which === "HEADER");
        const textPart = message.parts.find((p: any) => p.which === "TEXT");
        if (!headerPart || !textPart) continue;

        const header = headerPart.body;
        const text = textPart.body;

        const from = header.from?.[0] || "";
        const subject = header.subject?.[0] || "(no subject)";
        const inReplyTo = header["in-reply-to"]?.[0] || "";
        const references = (header.references || []).join(" ");
        const email = from.match(/<(.+)>/)?.[1] || "";
        const body = await this.cleanEmailBody(text);
        const object: data = {
          message_id: inReplyTo.trim(),
          email: email.trim(),
          body: body,
          subject: subject,
        };
        this.stor_email_data.push(object);
      }
      return this.stor_email_data;
    } catch (error: any) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  private async search_bd_this_email(data: data[]) {
    try {
      const transaction = await prisma.$transaction(async (tx) => {
        const find_all_email_data = await tx.reseve_email_validator.findMany({
          where: {
            message_id: {
              in: data.map((x) => x.message_id),
            },
            email: {
              in: data.map((x) => x.email),
            },
            status: schemaType.working_status.PANDING,
          },
          select: {
            id: true,
            email: true,
            message_id: true,
          },
        });
        const map2 = new Map(data.map((x) => [x.message_id, x]));
        // console.log("your data:", map2);

        const result = find_all_email_data
          .filter((x) => map2.has(x.message_id))
          .map((x) => {
            const mapped = map2.get(x.message_id);

            return {
              ...x,
              subject: mapped?.subject ?? null,
              body: mapped?.body ?? null,
            };
          });
        await tx.mail_template.createMany({
          data: result.map((item) => ({
            reseve_email_validator_id: item.id,
            template: {
              subject: item.subject,
              body: item.body,
              email: item.email,
            },
            create_at: new Date(),
          })),
          skipDuplicates: true,
        });

        await tx.reseve_email_validator.updateMany({
          where:{
            message_id: {
              in: data.map((x) => x.message_id),
            },
            email: {
              in: data.map((x) => x.email),
            },
          },
          data:{
            status: schemaType.working_status.SUCCESS
          
          },
          
        })

        await tx.cron_worker_counting_table.create({
          data: {
            privious_time: new Date(),
          },
        });

      const result_for_update_step =await tx.working_step_validator.findMany({
          where:{
            message_id:{
              in: result.map((x) => x.message_id),
            },
            email: {
              in: result.map((x) => x.email),
            }
          },
          select:{
            stepes_run_id:true,
            update_at:true,
            create_at:true,
            reseve_email_validator:{
              select:{
                id:true
              }
            }
          }
        })
        return result_for_update_step ;
        
      });


      return transaction;
    } catch (error: any) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  public async run(app_password: string, email: string) {
    try {
      const time = await this.fetch_all_from_our_gmail();
      await new Promise((resolve, reject) => setTimeout(resolve, 2000));
      const result_for_get_email = await this.get_all_email(
        email,
        app_password,
        time
      );
      await new Promise((resolve, reject) => setTimeout(resolve, 2000));
      const result = await this.search_bd_this_email(result_for_get_email);
      

      return result;
    } catch (error: any) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }
}

export { receive_email };
