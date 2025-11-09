import type { Request, Response, NextFunction } from "express";

export type async_handler_type = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<responceType | any>;

export interface responceType {
  statusCode: number;
  data?: object | {};
  message: string;
  error?: Error;
  success: boolean;
  stack?: string;
}

export interface gmail {
  email: string;
  app_password: string;
  message: string;
}
export interface telegram {
  chatId: number;
  token: string;
}

export type form = {
  field_name: string;
  element_type: string;
  placeholder: string;
};

export type scheduler = {
  time: string;
  email: string;
  app_password: string;
};

export interface recerve_email {
  email: string;
  app_password: string;
}
