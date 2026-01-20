"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const db_1 = require("./config/db");
const userRouter_1 = __importDefault(require("./router/userRouter"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
(0, db_1.connectDb)();
app.use("/api", userRouter_1.default);
const PORT = process.env.PORT || 2026;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map