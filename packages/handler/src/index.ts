import type { Request, Response, NextFunction } from "express";
import type { asyncFunction, type_for_responce } from "./types/index.js";
import promClient from "prom-client";

const async_handler =
  (func: asyncFunction) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next);
    } catch (error: any) {
      // Handle invalid JSON body
      if (error instanceof SyntaxError && "body" in error) {
        return res.status(400).json({
          success: false,
          message: "Invalid JSON format. Please check your request body.",
        });
      }
      return res.status(error.status || error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  };

class api_responce {
  statuscode: type_for_responce["statuscode"];
  data: type_for_responce["data"];
  message: type_for_responce["message"];
  success: type_for_responce["success"];

  constructor(
    statuscode: type_for_responce["statuscode"],
    data: type_for_responce["data"],
    message: type_for_responce["message"] = "success"
  ) {
    this.statuscode = statuscode;
    this.data = data;
    this.message = message;
    this.success = statuscode < 400;
  }
}

class api_error extends Error {
  statuscode!: type_for_responce["statuscode"];
  errors: type_for_responce["error"];
  override stack!: string;
  message: type_for_responce["message"];
  data: any[];

  constructor(
    statusCode: type_for_responce["statuscode"],
    message: type_for_responce["message"] = "something  went Wrong",
    errors: type_for_responce["error"] = [],
    stack = ""
  ) {
    super(message);
    this.statuscode = statusCode;
    this.message = message;
    this.data = [];
    this.errors = errors;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// metrix collect

const req_res_time = new promClient.Histogram({
  name: "http_express_req_res_time",
  help: "this tells how much time is taken by rreq and res",
  labelNames: ["method", "route", "status_code"],
  buckets: [1, 30, 50, 120, 200, 400, 500, 800, 1000, 2000],
});

const server_register = new promClient.Registry();
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ register: promClient.register });

const metrix_handler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.set("Content-Type", promClient.register.contentType);
  return res.send(await promClient.register.metrics());
};

function create_job_metrics(job_name: string) {
  if (!/^[a-zA-Z_:][a-zA-Z0-9_:]*$/.test(job_name)) {
    throw new Error(
      `Invalid job_name "${job_name}". Metric names must match /^[a-zA-Z_:][a-zA-Z0-9_:]*$/`
    );
  }

  const register = new promClient.Registry();

  const gateway = new promClient.Pushgateway(
    "http://localhost:9091",
    {},
    register
  );

  const job_counter = new promClient.Counter({
    name: `${job_name}_runs_total`,
    help: `total number of runs fro job ${job_name}`,
    registers: [register],
  });
  const job_duration = new promClient.Histogram({
    name: `${job_name}_duration_seconds`,
    help: `duration of job ${job_name}`,
    registers: [register],
    buckets: [0.1, 0.5, 1, 1.5, 2, 5, 10, 30],
  });

  return {
    job_counter,
    job_duration,
    push: async () => {
      try {
        await gateway.pushAdd({ jobName: job_name });
        console.log(` Metrics pushed for job: ${job_name}`);
      } catch (err: any) {
        console.error("Failed to push metrics:", err.message);
      }
    },
  };
}

export {
  api_error,
  api_responce,
  async_handler,
  metrix_handler,
  create_job_metrics,
  server_register,
  req_res_time,
};
