import { prisma, schemaType } from "@master/database";
import type { MessageFromProcessorReceiveEvent } from "../types/index.js";
import { Resend } from "resend";

export async function receive_email(step_run_id: number): Promise<boolean> {
  try {
    return await prisma.$transaction(async (ts) => {
      const validator = await ts.working_step_validator.findFirst({
        where: { stepes_run_id: step_run_id },
        orderBy: { id: "desc" },
        select: { id: true },
      });

      if (!validator) return false;

      const updated = await ts.working_step_validator.update({
        where: { id: validator.id },
        data: {
          status: schemaType.step_validation_status.NEXTSTAGE,
          update_at: new Date(),
        },
      });

      await ts.reseve_email_validator.create({
        data: {
          working_step_validator_id: updated.id,
          email: updated.email,
          message_id: updated.message_id,

          status: schemaType.working_status.CREATE,
          create_at: new Date(),
        },
      });

      return true;
    });
  } catch (error: any) {
    console.error("[ReceiveEmail] error:", error.message);
    throw new Error(error.message);
  }
}

export async function handle_incoming_email_webhook(
  payload: MessageFromProcessorReceiveEvent,
) {
  try {
    const find_receiver_email_array = payload.run.to;
    const extract_receiver_email_from_string =
      find_receiver_email_array[0]?.split("@");
    const sender_email = payload.run.from;
    if (!sender_email || !extract_receiver_email_from_string) {
      return false;
    }

    const result = await prisma.working_step_validator.findFirst({
      where: {
        email: sender_email,
        status: "NEXTSTAGE",
      },
      select: {
        id: true,
        stepes_run: {
          select: {
            id: true,
            workflow: {
              select: {
                id: true,
                stepes: {
                  where: {
                    name: "receive_email",
                  },
                  select: {
                    index: true,
                    meta_data: true,
                  },
                },
              },
            },
          },
        },
        reseve_email_validator: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!result) {
      return false;
    }

    const resend = new Resend(
      // @ts-ignore
      result?.stepes_run.workflow.stepes[0]?.meta_data.secret,
    );

    const responce_from_resend = await resend.emails.receiving.get(
      payload.run.email_id,
    );
 
    const {updated_reseve_email_validator_statue} = await prisma.$transaction(async (tx) => {
      const create_mail_template = await tx.mail_template.create({
        data: {
          reseve_email_validator_id: result.reseve_email_validator[0]?.id,
          template: {
            email: sender_email,
            body: responce_from_resend.data?.text,
            subject: responce_from_resend.data?.subject,
          },
          create_at: new Date(),
        },
      });

      const updated_reseve_email_validator_statue =
        await tx.reseve_email_validator.update({
          where: { id: create_mail_template.reseve_email_validator_id },
          data: {
            status: schemaType.working_status.SUCCESS,
            update_at: new Date(),
          },
        });

      return {
        create_mail_template,
        updated_reseve_email_validator_statue,
      };
    });

    return {
      payload: updated_reseve_email_validator_statue,
      step_run_id: result?.stepes_run.id,
      step: result?.stepes_run.workflow.stepes[0]?.index,
    };
  } catch (error) {
    return false;
  }
}
