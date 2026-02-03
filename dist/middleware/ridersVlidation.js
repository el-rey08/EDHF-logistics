"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRider = exports.riderValidationSchema = void 0;
const joi_1 = __importDefault(require("@hapi/joi"));
const ridersModel_1 = require("../models/ridersModel");
// -------------------- Regex --------------------
const phoneRegex = /^[0-9]{10,15}$/;
const vehicleNumberRegex = /^[A-Z0-9-]{5,10}$/;
const licenseNumberRegex = /^[A-Z0-9]{5,20}$/;
// -------------------- Joi Schema --------------------
exports.riderValidationSchema = joi_1.default.object({
    fullName: joi_1.default.string().min(3).max(50).required().messages({
        "string.base": "Full name must be a string",
        "string.empty": "Full name is required",
        "string.min": "Full name must be at least 3 characters",
        "string.max": "Full name cannot exceed 50 characters",
    }),
    email: joi_1.default.string().email().required().messages({
        "string.email": "Please provide a valid email",
        "string.empty": "Email is required",
    }),
    phoneNumber: joi_1.default.string().pattern(phoneRegex).required().messages({
        "string.pattern.base": "Phone number must be 10 to 15 digits",
        "string.empty": "Phone number is required",
    }),
    password: joi_1.default.string().min(6).required().messages({
        "string.min": "Password must be at least 6 characters",
        "string.empty": "Password is required",
    }),
    vehicleType: joi_1.default.string().valid("Bike", "Car", "Van", "Truck").required().messages({
        "any.only": "Vehicle type must be one of Bike, Car, Van, Truck",
        "string.empty": "Vehicle type is required",
    }),
    vehicleNumber: joi_1.default.string().pattern(vehicleNumberRegex).required().messages({
        "string.pattern.base": "Vehicle number is invalid",
        "string.empty": "Vehicle number is required",
    }),
    licenseNumber: joi_1.default.string().pattern(licenseNumberRegex).required().messages({
        "string.pattern.base": "License number is invalid",
        "string.empty": "License number is required",
    }),
    address: joi_1.default.string().min(10).max(200).required().messages({
        "string.empty": "Address is required",
        "string.min": "Address must be at least 10 characters",
        "string.max": "Address cannot exceed 200 characters",
    }),
    dateOfBirth: joi_1.default.date()
        .less("now")
        .greater("01-01-1950")
        .required()
        .custom((value, helpers) => {
        const age = new Date().getFullYear() - new Date(value).getFullYear();
        if (age < 18) {
            return helpers.error("any.custom");
        }
        return value;
    })
        .messages({
        "any.custom": "Rider must be at least 18 years old",
    })
        .messages({
        "date.base": "Date of birth must be a valid date",
        "date.less": "Date of birth cannot be in the future",
        "any.required": "Date of birth is required",
    }),
    profilePicture: joi_1.default.string().uri().optional().messages({
        "string.uri": "Profile picture must be a valid URL",
    }),
    idDocument: joi_1.default.string().uri().optional().messages({
        "string.uri": "ID document must be a valid URL",
    }),
});
// -------------------- Middleware --------------------
const validateRider = async (req, res, next) => {
    // 1️⃣ Validate body format with Joi
    const { error } = exports.riderValidationSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errors = error.details.map((detail) => detail.message);
        return res.status(400).json({ success: false, errors });
    }
    // 2️⃣ Check uniqueness in DB
    const { email, phoneNumber, licenseNumber, vehicleNumber } = req.body;
    const existingRider = await ridersModel_1.riderModel.findOne({
        $or: [
            { email },
            { phoneNumber },
            { licenseNumber },
            { vehicleNumber },
        ],
    });
    if (existingRider) {
        const conflicts = [];
        if (existingRider.email === email)
            conflicts.push("Email already exists");
        if (existingRider.phoneNumber === phoneNumber)
            conflicts.push("Phone number already exists");
        if (existingRider.governmentIdNumber === licenseNumber)
            conflicts.push("License number already exists");
        if (existingRider.vehicle === vehicleNumber)
            conflicts.push("Vehicle number already exists");
        return res.status(400).json({
            success: false,
            errors: conflicts
        });
    }
    next();
};
exports.validateRider = validateRider;
//# sourceMappingURL=ridersVlidation.js.map