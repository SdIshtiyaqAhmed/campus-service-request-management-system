const mongoose = require('mongoose');
const User = require('../models/User');
const Request = require('../models/Request');
const Feedback = require('../models/Feedback');

const sanitizeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
});

const getUsers = async (req, res, next) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                users: users.map(sanitizeUser)
            }
        });
    } catch (error) {
        next(error);
    }
};

const getUser = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user: sanitizeUser(user)
            }
        });
    } catch (error) {
        next(error);
    }
};

const updateUser = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        const allowedFields = ['name', 'role', 'department', 'isActive'];
        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (
            updates.role !== undefined &&
            !['student', 'staff', 'admin'].includes(updates.role)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user role'
            });
        }

        if (
            updates.isActive !== undefined &&
            typeof updates.isActive !== 'boolean'
        ) {
            return res.status(400).json({
                success: false,
                message: 'isActive must be a boolean'
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (
            user._id.toString() === req.user.userId &&
            updates.isActive === false
        ) {
            return res.status(400).json({
                success: false,
                message: 'You cannot deactivate your own account'
            });
        }

        Object.assign(user, updates);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: {
                user: sanitizeUser(user)
            }
        });
    } catch (error) {
        next(error);
    }
};

const getStatistics = async (req, res, next) => {
    try {
        const [
            totalUsers,
            activeUsers,
            usersByRole,
            totalRequests,
            requestsByStatus,
            requestsByPriority,
            requestsByCategory,
            resolvedRequests,
            closedRequests,
            feedbackStats
        ] = await Promise.all([
            User.countDocuments(),

            User.countDocuments({ isActive: true }),

            User.aggregate([
                {
                    $group: {
                        _id: '$role',
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ]),

            Request.countDocuments(),

            Request.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ]),

            Request.aggregate([
                {
                    $group: {
                        _id: '$priority',
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ]),

            Request.aggregate([
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'category',
                        foreignField: '_id',
                        as: 'category'
                    }
                },
                {
                    $unwind: {
                        path: '$category',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: '$category.name',
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                }
            ]),

            Request.countDocuments({
                status: 'resolved'
            }),

            Request.countDocuments({
                status: 'closed'
            }),

            Feedback.aggregate([
                {
                    $group: {
                        _id: null,
                        averageRating: { $avg: '$rating' },
                        totalFeedback: { $sum: 1 }
                    }
                }
            ])
        ]);

        const formatCounts = (items) =>
            items.reduce((result, item) => {
                result[item._id] = item.count;
                return result;
            }, {});

        const feedback = feedbackStats[0] || {
            averageRating: 0,
            totalFeedback: 0
        };

        res.status(200).json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    inactive: totalUsers - activeUsers,
                    byRole: formatCounts(usersByRole)
                },
                requests: {
                    total: totalRequests,
                    resolved: resolvedRequests,
                    closed: closedRequests,
                    byStatus: formatCounts(requestsByStatus),
                    byPriority: formatCounts(requestsByPriority),
                    byCategory: formatCounts(requestsByCategory)
                },
                feedback: {
                    total: feedback.totalFeedback,
                    averageRating: Number(
                        feedback.averageRating.toFixed(2)
                    )
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUsers,
    getUser,
    updateUser,
    getStatistics
};
