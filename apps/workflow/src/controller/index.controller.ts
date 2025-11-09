import api_responce from "../utils/api_responce.js";
import { api_error } from "../utils/api_error.js";
import async_handler from "../utils/async_handler.js";
import { prisma } from "@master/database";
import type { Request, Response } from "express";
import { type_chack_for_steps_metadata } from "../utils/meta_data_object_chack.js";

export const create_types_of_steps = async_handler(
  async (req: Request, res: Response) => {
    const { name, app, work_type, meta_data, image_url } = req.body;


    // chack all field and chack metadata are object or not null 
    // chack in bd  : exist or not  
    // create entry in our data base 
    // chack db entry : success of failed 
    // return success responce

    if ([name, app, work_type, image_url].some((field) => field === "")) {
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



export const get_all_types_of_step = async_handler(async(req ,res)=>{
    const get_all_type_of_step = await prisma.typeofstep.findMany()
    if (!get_all_type_of_step){
        throw new api_error(400,"type of steps are not exist",Error.prototype)
    }
    return res.status(200).json(new api_responce(200 ,[]," success fully get all data "))
})

