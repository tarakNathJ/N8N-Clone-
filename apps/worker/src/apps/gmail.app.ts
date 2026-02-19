
import { Resend } from "resend";
import type { gmail_type } from "../types/index.js";
import { prisma, schemaType } from "@master/database";

class mail_sender {
  async send_emiail_message(
    sender_email: gmail_type["sender_email"],
    sender_app_pass: gmail_type["sender_app_pass"],
    recever_email: gmail_type["recever_email"],
    message: gmail_type["message"],
    subject: gmail_type["subject"],
    stepes_run_id: number,
    stage: number, // renamed from index — was confusing
  ): Promise<boolean> {
    try {
      const resend = new Resend(sender_app_pass);

      const result = await resend.emails.send({
        from: `n8n <hello@${sender_email}>`,
        to: [recever_email],
        subject: subject,
        html: `<h2>${message}</h2>`,
      });

      if(result.error){

      }

      await prisma.working_step_validator.create({
        data: {
          message_id: result.data?.id!,
          stepes_run_id: stepes_run_id,
          email: recever_email,
          status: schemaType.step_validation_status.SUCCCESS,
          create_at: new Date(),
          index: stage,
        },
      });
      return true;
    } catch (error: any) {
      return false;
    }
  }
}

export { mail_sender };
