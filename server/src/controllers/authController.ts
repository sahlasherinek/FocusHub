import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User';
import Todo from '../models/Todo';
import { AuthRequest } from '../middleware/auth';

const generateToken = (userId: string, role: string): string => {
    return jwt.sign({ id: userId, role }, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    } as jwt.SignOptions);
};

export const unifiedLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // --- All validation happens up front, before touching the database ---
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        let user = await User.findOne({ email: normalizedEmail });
        let isNewUser = false;

        if (user) {
            // Existing user: verify password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
        } else {
            // New user: register automatically (role defaults to 'user' in the schema)
            user = await User.create({ email: normalizedEmail, password });
            isNewUser = true;
        }

        const token = generateToken(user.id, user.role);

        return res.status(200).json({
            token,
            user: { id: user.id, email: user.email, role: user.role },
            isNewUser,
        });
    } catch (err) {
        console.error('Auth error:', err);
        return res.status(500).json({ message: 'Server error, please try again' });
    }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        await Todo.deleteMany({ user: userId }, { session });
        const deletedUser = await User.findByIdAndDelete(userId, { session });

        if (!deletedUser) {
            // User didn't exist (already deleted / bad token) — abort, nothing to commit
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'User not found' });
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ message: 'Account deleted successfully' });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error('Delete account error:', err);
        return res.status(500).json({ message: 'Failed to delete account' });
    }
};