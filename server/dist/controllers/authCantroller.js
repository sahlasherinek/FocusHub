"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unifiedLogin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};
const unifiedLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }
        const normalizedEmail = email.toLowerCase().trim();
        let user = await User_1.default.findOne({ email: normalizedEmail });
        let isNewUser = false;
        if (user) {
            // Existing user: verify password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
        }
        else {
            // New user: register automatically
            user = await User_1.default.create({ email: normalizedEmail, password });
            isNewUser = true;
        }
        const token = generateToken(user.id);
        return res.status(200).json({
            token,
            user: { id: user.id, email: user.email },
            isNewUser,
        });
    }
    catch (err) {
        console.error('Auth error:', err);
        return res.status(500).json({ message: 'Server error, please try again' });
    }
};
exports.unifiedLogin = unifiedLogin;
