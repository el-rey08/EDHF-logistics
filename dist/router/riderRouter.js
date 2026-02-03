"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.riderRoutes = void 0;
const express_1 = __importDefault(require("express"));
const ridersContoller_1 = require("../controller/ridersContoller");
const ridersVlidation_1 = require("../middleware/ridersVlidation");
exports.riderRoutes = express_1.default.Router();
exports.riderRoutes.post("/signup", ridersVlidation_1.validateRider, ridersContoller_1.riderSignup);
exports.riderRoutes.post("/verify-email", ridersContoller_1.verifyEmailOTP);
exports.riderRoutes.post("/resend-otp", ridersContoller_1.resendOTP);
//# sourceMappingURL=riderRouter.js.map