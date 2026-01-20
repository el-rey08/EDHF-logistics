"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controller/userController");
const auth_1 = require("../middleware/auth");
exports.userRoutes = express_1.default.Router();
exports.userRoutes.post("/signup", userController_1.createUser);
exports.userRoutes.post("/login", userController_1.login);
//Get User
exports.userRoutes.get("/get-one/:id", auth_1.authenticate, userController_1.getOneUser);
exports.userRoutes.get("/getall", userController_1.getAllUser);
//update
exports.userRoutes.patch("/update-profile", auth_1.authenticate, userController_1.updateProfile);
exports.userRoutes.patch("/change-password", auth_1.authenticate, userController_1.changePassword);
//# sourceMappingURL=userRouter.js.map