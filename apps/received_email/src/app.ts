import express from "express";
import type { Express } from "express";
import cors from "cors";
import routers from "./router/index.route.js";
import { metrix_handler, req_res_time } from "@repo/handler";
import responceTime from "response-time";

class express_app {
  public app: Express = express();

  constructor() {
    this.app.use(
      cors({
        origin: "*",
      })
    );

    this.app.use(
      responceTime((req, res, time) => {
      req_res_time
    .labels({
      method: req.method || "UNKNOWN_METHOD",
      route:
       //@ts-ignore
        (req.route && req.route.path) ||
        //@ts-ignore
        req.originalUrl ||
        req.url ||
        "UNKNOWN_ROUTE",
      status_code: res.statusCode.toString(),
    })
    .observe(time);
      })
    );

    this.app.use(express.json());
    this.app.use("/api", routers);
    
    this.app.get("/metrics", metrix_handler);
  }
}

export { express_app };
