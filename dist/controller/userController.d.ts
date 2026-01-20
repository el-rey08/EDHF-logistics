import { Request, Response } from "express";
export declare const createUser: (req: Request, res: Response) => Promise<void>;
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const getOneUser: (req: Request, res: Response) => Promise<void>;
export declare const getAllUser: (req: Request, res: Response) => Promise<void>;
export declare const updateProfile: (req: any, res: Response) => Promise<void>;
export declare const changePassword: (req: any, res: Response) => Promise<void>;
export declare const verifyEmailOTP: (req: any, res: any) => Promise<any>;
export declare const resendOTP: (req: any, res: any) => Promise<any>;
