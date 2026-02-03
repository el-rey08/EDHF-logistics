import { Request, Response } from "express";
export declare const riderSignup: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const verifyEmailOTP: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const resendOTP: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const forgotPassword: (req: any, res: any) => Promise<any>;
export declare const logout: (req: any, res: Response) => Promise<void>;
