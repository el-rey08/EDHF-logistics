"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const date = new Date();
exports.createUser = async (req, res) => {
    try {
        const { fullName, email, password, phoneNumber, address, confirmPassword, } = req.body;
        if (!fullName || !email || !password || !phoneNumber || !address || !confirmPassword) {
            return res.status(400).json({
                status: "bad request",
                message: "please enter all fields",
            });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({
                status: "bad request",
                message: "passwords do not match",
            });
        }
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: "bad request",
                message: "email already exists",
            });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = new userModel({
            fullName: fullName.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            phoneNumber: phoneNumber.trim(),
            address: address.trim(),
        });
        await user.save();
        res.status(201).json({
            status: "success",
            message: "user created successfully",
            user,
        });
    }
    catch (error) {
        res.status(500).json({
            status: "server error",
            message: error.message,
        });
    }
};
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = userModel.findOne({ email: email.toLowerCase() });
        if (!existingUser) {
            return res.status(400).json({
                status: 'bad request',
                message: 'this user does not exist please create an account'
            });
        }
        const checkPassword = await bcrypt.compare(password, existingUser.password);
        if (!checkPassword) {
            return res.status(400).json({
                status: 'bad request',
                message: 'incorrect password please check your password'
            });
        }
        return res.status(200).json({
            status: 'OK',
            message: `${existingUser.fullName} is logged in`,
            data: existingUser.fullName
        });
    }
    catch (error) {
        return res.status(500).json({
            status: 'server error',
            message: error.message
        });
    }
};
exports.getOneUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await userModel.findOne({ userId });
        if (!user) {
            return res.status(404).json(`User not found.`);
        }
        res.status(200).json({
            message: `Dear ${user.firstName}, below is ur info`,
            data: user
        });
    }
    catch (error) {
        return res.status(500).json({
            status: 'server error',
            message: error.message
        });
    }
};
//# sourceMappingURL=userController.js.map