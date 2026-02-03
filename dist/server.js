"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const db_1 = require("./config/db");
const userRouter_1 = require("./router/userRouter");
const riderRouter_1 = require("./router/riderRouter");
const app = (0, express_1.default)();
app.use(express_1.default.json());
(0, db_1.connectDb)();
app.use("/api/users", userRouter_1.userRoutes);
app.use("/api/riders", riderRouter_1.riderRoutes);
const PORT = process.env.PORT || 2026;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map