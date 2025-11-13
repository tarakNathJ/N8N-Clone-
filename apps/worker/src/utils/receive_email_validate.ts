import { prisma, schemaType } from "@master/database";

export async function receive_email(step_run_id: number) {
  try {
     const update_status =   await prisma.$transaction(async (ts) => {
      const find_working_step_validator =
        await ts.working_step_validator.findFirst({
          where: {
            stepes_run_id: step_run_id,
          },
          select: {
            id: true,
          },
        });
      if (!find_working_step_validator) {
        return false;
      }
      const update_working_step_validator =
        await ts.working_step_validator.update({
          where: {
            id: find_working_step_validator.id,
          },
          data: {
            status: schemaType.step_validation_status.NEXTSTAGE,
            update_at: new Date(),
          },
        });
      await ts.reseve_email_validator.create({
        data: {
          working_step_validator_id: update_working_step_validator.id,
          email: update_working_step_validator.email,
          message_id: update_working_step_validator.message_id,
          status: schemaType.working_status.CREATE,
          create_at: new Date(),
        },


      });


      return true;
    });
    return update_status ? true : false;
  } catch (error: any) {
    console.log(error.message);
    throw new Error(error.message);
  }
}
