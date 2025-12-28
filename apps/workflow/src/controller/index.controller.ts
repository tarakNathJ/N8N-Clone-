import { prisma, schemaType } from "@master/database";
import type { Request, Response } from "express";
import { type_chack_for_steps_metadata } from "../utils/meta_data_object_chack.js";
import { api_responce, async_handler, api_error } from "@repo/handler";

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

// get all typesofstep
export const get_all_types_of_step = async_handler(async (req, res) => {
  const get_all_type_of_step = await prisma.typeofstep.findMany();
  if (!get_all_type_of_step) {
    throw new api_error(400, "type of steps are not exist", Error.prototype);
  }
  return res
    .status(200)
    .json(new api_responce(200, [], " success fully get all data "));
});

//create stpe
export const create_step = async_handler(
  async_handler(async (req, res) => {
    const { name, index, workflow_id, meta_data, typeofstap_id } = req.body;

    if (
      !name == null ||
      !index == null ||
      !workflow_id == null ||
      !typeofstap_id == null ||
      typeof meta_data !== "object" ||
      meta_data === null
    ) {
      throw new api_error(400, "full fill all requirement", Error.prototype);
    }

    console.log(name, index, workflow_id, typeofstap_id, meta_data);
    let status = false;

    // chack every apps metadata are exist or not
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
      case "receive_email":
        status = new type_chack_for_steps_metadata().is_recerve_email(
          meta_data
        );
        break;
      case "form":
        status = new type_chack_for_steps_metadata().is_from(meta_data);
        break;
      case "webhook":
        status = new type_chack_for_steps_metadata().is_webhook(meta_data);
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

    // chack workflow are exist or not
    const chack_workflow_exist_or_not = await prisma.workflow.findFirst({
      where: {
        id: workflow_id,
        //@ts-ignore
        user_id: req.user.id,
      },
    });
    if (!chack_workflow_exist_or_not) {
      throw new api_error(
        409,
        "workflow are not exist , try again",
        Error.prototype
      );
    }

    // chack typeofstep  are exist or not
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

    if (
      chack_typeofstep_are_exist_or_not.app === "webhook" &&
      name === "webhook"
    ) {
      // @ts-ignore
      meta_data.URL = `${process.env.WORKFLOW_SERVER_URL}/${chack_workflow_exist_or_not.id}/${req.user.id}`;
    }

    // even step are exist thi update or not exist then then creat
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
        //@ts-ignore
        user_id: req.user.id,
        workflow_id: chack_workflow_exist_or_not.id,
        meta_data,
        status: schemaType.status.ACTIVE,
        update_at: new Date(),
      },

      create: {
        name,
        index,
        typeofstap_id: chack_typeofstep_are_exist_or_not.id,
        // @ts-ignore
        user_id: req.user.id,
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
    data: {
      name: `${name}-${new Date()}`,
      //@ts-ignore
      user_id: req.user.id,
      status: "ACTIVE",
      //@ts-ignore
      create_at: new Date(),
    },
    select: {
      name: true,
      create_at: true,
    },
  });

  // chack workflow are actually are create or not
  if (!create_workflow) {
    throw new api_error(400, "db entry failed : try again", Error.prototype);
  }

  return res
    .status(201)
    .json(
      new api_responce(
        201,
        create_workflow,
        "success fully create your workflow"
      )
    );
});

// get all  workflow
export const get_all_workflow = async_handler(async (req, res) => {
  // get  all workflow
  const get_workflow = await prisma.workflow.findMany({
    where: {
      //@ts-ignore
      user_id: req.user.id,
    },
    select: {
      id: true,
      name: true,
      create_at: true,

      // counts
      _count: {
        select: {
          stepes: true,
          stepes_runs: true,
        },
      },

      // ⭐ FIRST STEP
      stepes: {
        orderBy: {
          index: "asc", 
        },
        take: 1, 
        select: {
          id: true,
          name: true,
          index: true,
          meta_data: true,
          status: true,
          create_at: true,
        },
      },
    },
  });

  // chack workflow are exist or not
  if (!get_workflow) {
    throw new api_error(400, "you dont have any workflow", Error.prototype);
  }

  return res
    .status(200)
    .json(new api_responce(200, get_workflow, "this is your  all workflow"));
});

// get all steps
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

// webhook call
export const webhook_call = async_handler(async (req, res) => {

  
  const { workflow_id, user_id } = req.params;
  console.log(workflow_id, " : ", user_id);
  const body = req.body;

  //@ts-ignore
  const convert_workflow_id_string_to_number = parseInt(workflow_id);
  //@ts-ignore
  const convert_user_id_string_to_number = parseInt(user_id);

  if (
    convert_workflow_id_string_to_number == null ||
    convert_user_id_string_to_number == null
  ) {
    throw new api_error(400, "all field are required", Error.prototype);
  }
  const find_workflow_are_exist_or_not = await prisma.workflow.findFirst({
    where: {
      // @ts-ignore
      id: convert_workflow_id_string_to_number,
      // @ts-ignore
      user_id: convert_user_id_string_to_number,
    },
    select: {
      id: true,
    },
  });

  if (!find_workflow_are_exist_or_not) {
    throw new api_error(404, "workflow are not exist", Error.prototype);
  }

  const create_transaction = await prisma.$transaction(async (ts) => {
    const create_stepes_run = await ts.stepes_run.create({
      data: {
        meta_data: body,
        status: "CREATE",
        workflow_id: find_workflow_are_exist_or_not.id,
        //@ts-ignore
        create_at: new Date(),
      },
    });
    await ts.out_box_step_run.create({
      data: {
        stepes_run_id: create_stepes_run.id,
        // @ts-ignore
        create_at: new Date(),
      },
    });

    return true;
  });

  if (!create_transaction) {
    throw new api_error(400, "db entry failed : try again", Error.prototype);
  }

  return res
    .status(201)
    .json(new api_responce(201, [], "success fully create your workflow"));
});

// get workflow data  base in workflow id from
export const get_workflow_data = async_handler(async (req, res) => {
  const { workflow_id } = req.params;
  console.log(workflow_id);

  if (!workflow_id) {
    throw new api_error(400, "all field are required", Error.prototype);
  }

  // find all stapes for  this workflow
  const find_workflow_are_exist_or_not = await prisma.workflow.findFirst({
    where: {
      id: parseInt(workflow_id),
      // @ts-ignore
      user_id: req.user.id,
    },
    select: {
      name: true,
      create_at: true,
      id: true,
      stepes: {
        select: {
          name: true,
          index: true,
          meta_data: true,
          status: true,
          create_at: true,
          id: true,
        },
      },
    },
  });

  const get_all_type_of_step = await prisma.typeofstep.findMany();
  if (!find_workflow_are_exist_or_not) {
    throw new api_error(404, "workflow are not exist", Error.prototype);
  }
  return res
    .status(200)
    .json(
      new api_responce(200, {
        find_workflow_are_exist_or_not,
        get_all_type_of_step,
      })
    );
});
