import api_responce from "../utils/api_responce.js";
import { api_error } from "../utils/api_error.js";
import async_handler from "../utils/async_handler.js";
import  {prisma} from "@master/database"
import type { Request ,Response } from "express";



// export const  create_types_of_steps = async_handler(async(req :Request , res :Response )=>{

//     const { name , app ,work_type ,meta_data,image_url } = req.body;


//     if ([name ,app , work_type , meta_data , image_url].some((field)=>field === "")){
//         throw new api_error (400 , "all field are required",Error.prototype)
//     }




// })