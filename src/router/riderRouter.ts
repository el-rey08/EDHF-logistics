import express, { Router } from "express";
import { riderSignup, verifyEmailOTP, resendOTP, updateLocation } from "../controller/ridersContoller";
import { validateRider } from "../middleware/ridersVlidation";
import { authenticate } from "../middleware/auth";
export const riderRoutes: Router = express.Router();
riderRoutes.post("/signup", validateRider, riderSignup);
riderRoutes.post("/verify-email", verifyEmailOTP);
riderRoutes.post("/resend-otp", resendOTP);
riderRoutes.put("/location", authenticate, updateLocation);
