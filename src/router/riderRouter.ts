import express, { Router } from "express";
import { riderSignup, verifyEmailOTP, resendOTP } from "../controller/ridersContoller";
import { validateRider } from "../middleware/ridersVlidation";

export const riderRoutes: Router = express.Router();

riderRoutes.post("/signup", validateRider, riderSignup);
riderRoutes.post("/verify-email", verifyEmailOTP);
riderRoutes.post("/resend-otp", resendOTP);
