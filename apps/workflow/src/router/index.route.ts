import express from "express";
import {
  create_types_of_steps,
  get_all_types_of_step,
  create_step,
  get_all_steps,
  create_work_flow,
  get_all_workflow,
  webhook_call,
  get_workflow_data,
  save_workflow
} from "../controller/index.controller.js";
import { verify_JWT } from "../middleware/index.middleware.js";

const router = express();

router.route("/create-type-of-step").post(create_types_of_steps);
router.route("/get-all-steps").post(get_all_types_of_step);
router.route("/get-steps").post(verify_JWT, get_all_steps);
router.route("/create-step").post(verify_JWT, create_step);
router.route("/create-workflow").post(verify_JWT, create_work_flow);
router.route("/get-workflow").get(verify_JWT, get_all_workflow);
router.route("/webhook/:workflow_id/:user_id").post(webhook_call);
router.route("/get-workflow-data/:workflow_id").get(verify_JWT, get_workflow_data);
router.route("/save-workflow").post(verify_JWT,save_workflow)

export default router;
