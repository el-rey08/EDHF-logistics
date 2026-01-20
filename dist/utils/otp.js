"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = void 0;
const generateOTP = (length = 6) => {
    return Math.floor(Math.pow(10, length - 1) +
        Math.random() * Math.pow(10, length)).toString();
};
exports.generateOTP = generateOTP;
//# sourceMappingURL=otp.js.map