import express from "express"
import { create_types_of_steps ,get_all_types_of_step ,create_step,get_all_steps,create_work_flow ,get_all_workflow } from "../controller/index.controller.js"
import { verify_JWT } from "../middleware/index.middleware.js";


const router = express()

router.route("/create-type-of-step").post(create_types_of_steps);
router.route("/get-all-steps").post(get_all_types_of_step);
router.route("/get-steps").post(verify_JWT,get_all_steps);
router.route("/create-step").post(verify_JWT,create_step);
router.route("/create-workflow").post(verify_JWT,create_work_flow)
router.route("/get-workflow").get(verify_JWT,get_all_workflow)



export default router

