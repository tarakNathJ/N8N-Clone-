import type { responceType } from "../types/index.js";



class api_error extends Error {
  statuscode: responceType["statusCode"];
  errors? :responceType["error"];
  override stack!: string;
  message: responceType["message"];
  data: any[];

  constructor(
    statusCode: responceType["statusCode"],
    message: responceType["message"] = "something  went Wrong",
    errors :responceType["error"] ,
    stack = ""
  ) {
    super(message);
    this.statuscode = statusCode;
    this.message = message;
    this.data  = []
    this.errors = errors;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
  


export  { api_error}
