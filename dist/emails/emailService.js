"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: Number(process.env.MAIL_PORT) === 465, // true for 465, false for 587
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});
// Optional verification
transporter.verify((error) => {
    if (error) {
        console.error("❌ Mail server connection failed:", error);
    }
    else {
        console.log("✅ Mail server is ready to send emails");
    }
});
// Send email helper
const sendEmail = async ({ to, subject, html, }) => {
    try {
        await transporter.sendMail({
            from: process.env.MAIL_FROM, // fixed
            to,
            subject,
            html,
        });
    }
    catch (error) {
        console.error("❌ Failed to send email:", error.message);
        throw new Error("Email delivery failed");
    }
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=emailService.js.map