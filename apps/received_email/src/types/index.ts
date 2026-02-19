import type { Request, Response, NextFunction } from "express";

export type asyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<type_for_responce | any>;

export type type_for_responce = {
  statuscode: number;
  data: object | null;
  message: string;
  success?: boolean;
  error?: Error | [];
  stack ?: string | null
};
