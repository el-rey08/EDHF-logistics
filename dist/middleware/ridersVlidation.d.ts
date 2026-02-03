import Joi from "@hapi/joi";
import { Request, Response, NextFunction } from "express";
export declare const riderValidationSchema: Joi.ObjectSchema<any>;
export declare const validateRider: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
