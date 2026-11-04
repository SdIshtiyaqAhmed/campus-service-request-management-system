const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '1d'
        }
    );
};

const sanitizeUser = (user) => {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || null,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
};

const register = async (req, res, next) => {
    try {
        const {
            name,
            email,
            password,
            department
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            department
        });

        const token = generateToken(user);

        return res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: sanitizeUser(user),
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'This account has been deactivated'
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: sanitizeUser(user),
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User profile retrieved successfully',
            data: {
                user: sanitizeUser(user)
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getMe
};
