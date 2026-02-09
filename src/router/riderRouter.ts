import express, { Router } from "express";
import { riderSignup, verifyEmailOTP, resendOTP, updateLocation } from "../controller/ridersContoller.js";
import { validateRider } from "../middleware/ridersVlidation.js";
import { authenticate } from "../middleware/auth.js";
export const riderRoutes: Router = express.Router();
riderRoutes.post("/signup", validateRider, riderSignup);
riderRoutes.post("/verify-email", verifyEmailOTP);
riderRoutes.post("/resend-otp", resendOTP);
riderRoutes.put("/location", authenticate, updateLocation);
