"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
require("dotenv").config();
const authenticate = async (req, res, next) => {
    try {
        const auth = req.headers.authorization;
        if (!auth) {
            return res.status(401).json({ message: "Authorization required" });
        }
        const token = auth.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error(error.message);
        return res.status(401).json({ message: "please log-in again" });
    }
};
const checkAdminOrTeacher = async (req, res, next) => {
    try {
        const adminUser = await schoolModel.findById(req.user.userId);
        const teacherUser = await teacherModel.findById(req.user.userId);
        if (adminUser && adminUser.role === 'admin') {
            next();
        }
        else if (teacherUser && teacherUser.role === 'teacher') {
            next();
        }
        else {
            return res.status(403).json({
                status: "Forbidden",
                message: "Access denied. You are not authorized to perform this action",
            });
        }
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
const checkAdmin = async (req, res, next) => {
    try {
        const user = await schoolModel.findById(req.user.userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                status: "Forbidden",
                message: "Access denied. You must be an admin to perform this action",
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({
            status: "Error",
            message: "An error occurred while checking teacher status",
        });
    }
};
module.exports = {};
//# sourceMappingURL=auth.js.map