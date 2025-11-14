import { prisma } from "@master/database"
import corn from "node-cron"


const mail_function = async()=>{

    let privious_time = new Date(Date.now() - 20 * 60 * 1000);
    // get resent submit entry
    const privious_runtime =  await prisma.cron_worker_counting_table.findFirst({
        orderBy:{
            privious_time : "desc"
        },
        select:{
            privious_time:true
        }
    })
    if (privious_runtime){
        privious_time = privious_runtime.privious_time;
    }

    
}


