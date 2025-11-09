import express from "express"
import { create_types_of_steps ,get_all_types_of_step ,create_step } from "../controller/index.controller.js"

const router = express()

router.route("/create-type-of-step").post(create_types_of_steps);
router.route("/get-all-steps").post(get_all_types_of_step);



export default router

