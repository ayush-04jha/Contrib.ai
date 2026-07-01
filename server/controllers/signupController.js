import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import mongoose from "mongoose";
export const signup = async (req, res) => {
    try {
        const {username, email, password } = req.body;
        console.log("email:", email);
        
        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        // Existing User Check
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User
        const user = await User.create({
            name: username,
            email,
            password: hashedPassword
        });

        // Generate JWT
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // Store token in cookie
        res.cookie('token', token, {
            httpOnly: true,                         // Protection against XSS
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'lax',                        // Protection against CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000,        // 7 days
        });

        return res.status(201).json({
            success: true,
            token,
            message: "Signup successful",
            user: {
                id: user._id,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Signup Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};