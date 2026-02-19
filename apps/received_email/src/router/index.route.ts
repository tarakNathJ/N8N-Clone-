import express from "express";
import { handle_email_reply_webhook } from "../controller/index.controller.js";

const routers = express.Router();

routers.route("/webhook").post(handle_email_reply_webhook);

export default routers;
