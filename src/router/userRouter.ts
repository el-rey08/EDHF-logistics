import express, { Router } from "express";
import {
    createUser,
    login,
    getOneUser,
    getAllUser,
    updateProfile,
    changePassword,
    verifyEmailOTP,
    resendOTP,
    forgotPassword,
    logout,
    getAvailableRiders
} from "../controller/userController";
import { authenticate } from "../middleware/auth";
import { upload } from "../utils/multer";

export const userRoutes: Router = express.Router();

userRoutes.post("/signup", upload.single("profileImage"), createUser);
userRoutes.post("/login", login);

//Get User
userRoutes.get("/get-one/:id", authenticate, getOneUser);
userRoutes.get("/getall", getAllUser)


//update
userRoutes.patch("/update-profile", authenticate, updateProfile);
userRoutes.patch("/change-password", authenticate, changePassword);

// OTP
userRoutes.post("/verify-email", verifyEmailOTP);
userRoutes.post("/resend-otp", resendOTP);
userRoutes.post("/forgot-password", forgotPassword);
userRoutes.post("/logout", authenticate, logout);

//riders
userRoutes.get("/available-riders", authenticate, getAvailableRiders);

