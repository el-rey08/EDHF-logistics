"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareHash = exports.hashValue = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const hashValue = async (value) => {
    return bcrypt_1.default.hash(value, 10);
};
exports.hashValue = hashValue;
const compareHash = async (value, hashedValue) => {
    return bcrypt_1.default.compare(value, hashedValue);
};
exports.compareHash = compareHash;
//# sourceMappingURL=hash.js.map