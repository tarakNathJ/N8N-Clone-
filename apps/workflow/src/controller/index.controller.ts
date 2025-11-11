import api_responce from "../utils/api_responce.js";
import { api_error } from "../utils/api_error.js";
import async_handler from "../utils/async_handler.js";
import { prisma, schemaType } from "@master/database";
import type { Request, Response } from "express";
import { type_chack_for_steps_metadata } from "../utils/meta_data_object_chack.js";

export const create_types_of_steps = async_handler(
  async (req: Request, res: Response) => {
    const { name, app, action, work_type, meta_data, image_url } = req.body;

    // chack all field and chack metadata are object or not null
    // chack in bd  : exist or not
    // create entry in our data base
    // chack db entry : success of failed
    // return success responce

    if (
      [name, app, action, work_type, image_url].some((field) => field === "")
    ) {
      throw new api_error(400, "all field are required", Error.prototype);
    }
    if (typeof meta_data !== "object" && meta_data !== null) {
      throw new api_error(400, "provide meta data ", Error.prototype);
    }

    const chack_this_type_of_step_are_exist_or_not =
      await prisma.typeofstep.findFirst({
        where: {
          app: app,
          work_type: work_type,
        },
      });
    if (chack_this_type_of_step_are_exist_or_not) {
      throw new api_error(
        409,
        "this typeofstep are all rady exist",
        Error.prototype
      );
    }
    const create_type_of_step = await prisma.typeofstep.create({
      data: {
        name: name,
        app: app,
        work_type: work_type,
        action: action,
        meta_data: meta_data,
        image_url: image_url,
        create_at: new Date(),
      },
      select: {
        name: true,
        image_url: true,
        create_at: true,
      },
    });

    if (!create_type_of_step) {
      throw new api_error(
        400,
        "database entry  failed  try again",
        Error.prototype
      );
    }

    return res
      .status(201)
      .json(
        new api_responce(201, create_type_of_step, "succcess fully create step")
      );
  }
);

export const get_all_types_of_step = async_handler(async (req, res) => {
  const get_all_type_of_step = await prisma.typeofstep.findMany();
  if (!get_all_type_of_step) {
    throw new api_error(400, "type of steps are not exist", Error.prototype);
  }
  return res
    .status(200)
    .json(new api_responce(200, [], " success fully get all data "));
});

export const create_step = async_handler(
  async_handler(async (req, res) => {
    const { name, index, workflow_id, meta_data, typeofstap_id } = req.body;

    if (
      !name ||
      !index ||
      !workflow_id ||
      !typeofstap_id ||
      typeof meta_data !== "object" ||
      meta_data === null
    ) {
      throw new api_error(400, "full fill all requirement", Error.prototype);
    }

    let status = false;

    switch (name) {
      case "gmail":
        status = new type_chack_for_steps_metadata().is_gmail(meta_data);
        break;
      case "telegram":
        status = new type_chack_for_steps_metadata().is_telegram(meta_data);
        break;
      case "scheduler":
        status = new type_chack_for_steps_metadata().is_scheduler(meta_data);
        break;
      case "recerve_email":
        status = new type_chack_for_steps_metadata().is_recerve_email(
          meta_data
        );
        break;
      case "form":
        status = new type_chack_for_steps_metadata().is_from(meta_data);
        break;
      default:
        status = false;
        break;
    }

    if (!status) {
      throw new api_error(
        409,
        " metadata missmatch , try again",
        Error.prototype
      );
    }

    const find_user_are_exist_or_not = await prisma.user.findFirst({
      where: {
        //@ts-ignore
        id: req.id,
      },
    });
    if (!find_user_are_exist_or_not) {
      throw new api_error(
        409,
        "user are not exist , try again",
        Error.prototype
      );
    }

    const chack_workflow_exist_or_not = await prisma.workflow.findFirst({
      where: {
        id: workflow_id,
        //@ts-ignore
        user_id: find_user_are_exist_or_not.id,
      },
    });
    if (!chack_workflow_exist_or_not) {
      throw new api_error(
        409,
        "workflow are not exist , try again",
        Error.prototype
      );
    }
    const chack_typeofstep_are_exist_or_not = await prisma.typeofstep.findFirst(
      {
        where: {
          id: typeofstap_id,
          name: name,
        },
        select: {
          app: true,
          id: true,
        },
      }
    );
    if (!chack_typeofstep_are_exist_or_not) {
      throw new api_error(
        409,
        "typeofstep are not exist , try again",
        Error.prototype
      );
    }

    const create_step = await prisma.step.upsert({
      where: {
        workflow_id_index: {
          index: index,
          workflow_id: chack_workflow_exist_or_not.id,
        },
      },
      update: {
        name,
        typeofstap_id: chack_typeofstep_are_exist_or_not.id,
        user_id: find_user_are_exist_or_not.id,
        workflow_id: chack_workflow_exist_or_not.id,
        meta_data,
        status: schemaType.status.ACTIVE,
        update_at: new Date(),
      },

      create: {
        name,
        index,
        typeofstap_id: chack_typeofstep_are_exist_or_not.id,
        user_id: find_user_are_exist_or_not.id,
        workflow_id: chack_workflow_exist_or_not.id,
        meta_data,
        status: schemaType.status.ACTIVE,
        create_at: new Date(),
      },
      select: {
        name: true,
        status: true,
        create_at: true,
      },
    });

    if (!create_step) {
      throw new api_error(400, "db entry failed : try again", Error.prototype);
    }

    return res
      .status(201)
      .json(new api_responce(201, create_step, "success fully create step"));
  })
);

export const create_work_flow = async_handler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    throw new api_error(400, "full fill all requirement", Error.prototype);
  }

  // create new workflow
  const create_workflow = await prisma.workflow.create({
    data:{
      name:`${name}-${new Date}`,
      //@ts-ignore
      user_id: req.user.id,
      status:"ACTIVE",
      create_at:new Date()
    },
    select:{
      name:true,
      create_at:true
    }
  })

  if(!create_workflow){
    throw new api_error(400,"db entry failed : try again", Error.prototype)
  }

  return res.status(201).json(new api_responce(201,create_workflow,"success fully create your workflow"))

});

export const get_all_workflow = async_handler(async(req ,res)=>{
// get  all workflow
  const get_workflow = await prisma.workflow.findMany({
    where:{
      // @ts-ignore
      user_id:req.user.id
    }
  })


  if (!get_workflow){

    throw new api_error(400, "you dont have any workflow",Error.prototype)

  }

  return res.status(200).json( new  api_responce (200,get_workflow,"this is your  all workflow") )
  
})




export const get_all_steps = async_handler(async (req, res) => {
  const { workflowId } = req.body;
  if (!workflowId) {
    {
      throw new api_error(400, "full fill all requirement", Error.prototype);
    }
  }

  const find_steps = await prisma.step.findMany({
    where: {
      workflow_id: workflowId,
      // @ts-ignore
      user_id: req.id,
    },
  });
  return res
    .status(200)
    .json(new api_responce(200, find_steps, "thats your all steps"));
});
