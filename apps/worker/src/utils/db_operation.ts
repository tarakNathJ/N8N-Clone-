
import { prisma } from "@master/database";

type StepData = {
  get_step_find_by_id_and_index: {
    name: string;
    meta_data: any;
  };
  get_steprun_table: {
    meta_data: any;
    workflow_id: number;
  };
};

class database_service_provider {
  async getdata(id: number, stage: number): Promise<StepData | false> {
    try {
      // @ts-ignore
      return await prisma.$transaction(async (ts) => {
        const steprun = await ts.stepes_run.findFirst({
          where: { id },
          select: { meta_data: true, workflow_id: true },
        });

        if (!steprun) return false;

        const step = await ts.step.findUnique({
          where: {
            workflow_id_index: {
              workflow_id: steprun.workflow_id as number,
              index: stage,
            },
          },
          select: { name: true, meta_data: true },
        });

        if (!step) return false;

        return {
          get_step_find_by_id_and_index: step,
          get_steprun_table: steprun,
        };
      });
    } catch (error: any) {
      console.error("[DB] getdata error:", error.message);
      return false;
    }
  }
}

export { database_service_provider };