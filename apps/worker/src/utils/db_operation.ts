import { prisma, schemaType } from "@master/database";

type responce_type = {
    meta_data:object,
    name:string
}
class database_service_provider {
  constructor(id: number, stage: number){
    const prisma_transaction = prisma.$transaction(async (ts) => {
      const get_steprun_table = await ts.stepes_run.findFirst({
        where: {
          id: id,
        },
        select: {
          meta_data: true,
          workflow_id: true,
        },
      });


      const get_step_find_by_id_and_index = await ts.step.findUnique({
        where: {
          workflow_id_index: {
            workflow_id: get_steprun_table?.workflow_id as number,
            index: stage,
          },
          
        },
        select:{
            name:true,
            meta_data: true
        }

    
      });

      return get_step_find_by_id_and_index;

    });


  }
}

export { database_service_provider };
