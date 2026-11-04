const express = require('express');

const {
    authenticate,
    authorize
} = require('../middleware/auth.middleware');

const router = express.Router();

router.get(
    '/student',
    authenticate,
    authorize('student'),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: 'Student access granted',
            data: {
                userId: req.user.userId,
                role: req.user.role
            }
        });
    }
);

router.get(
    '/staff',
    authenticate,
    authorize('staff'),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: 'Staff access granted',
            data: {
                userId: req.user.userId,
                role: req.user.role
            }
        });
    }
);

router.get(
    '/admin',
    authenticate,
    authorize('admin'),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: 'Admin access granted',
            data: {
                userId: req.user.userId,
                role: req.user.role
            }
        });
    }
);

module.exports = router;
