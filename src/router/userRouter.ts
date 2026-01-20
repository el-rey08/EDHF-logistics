import express, { Router } from "express";
import { createUser, login, getOneUser, getAllUser, updateProfile, changePassword } from "../controller/userController";
import { authenticate } from "../middleware/auth";

export const userRoutes: Router = express.Router();

userRoutes.post("/signup", createUser);
userRoutes.post("/login", login);

//Get User
userRoutes.get("/get-one/:id", authenticate, getOneUser);
userRoutes.get("/getall",getAllUser)


//update
userRoutes.patch("/update-profile", authenticate, updateProfile);
userRoutes.patch("/change-password", authenticate, changePassword);

