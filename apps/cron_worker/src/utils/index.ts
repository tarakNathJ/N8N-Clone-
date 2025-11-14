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
  private time: Date = new Date(Date.now() - 20 * 60 * 1000);

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
          status: schemaType.working_status.CREATE,
        },
        select: {
          id: true,
          email: true,
          message_id: true,
        },
      });

      const map2 = new Map(find_all_email_data.map((x) => [x.email, x]));

      const result = data
        .filter((x) => map2.has(x.email))
        .map((x) => ({
          ...x,
          //@ts-ignore
          id: map2.get(x.email).id,
        }));

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


      return find_all_email_data;
     });
    } catch (error: any) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }
}
