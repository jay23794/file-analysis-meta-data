import type { NextFunction } from "express";
import { NotFoundError } from "./custom.errors.js";


export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  next(new NotFoundError(`Route ${req.method} ${req.url} not found`));
};