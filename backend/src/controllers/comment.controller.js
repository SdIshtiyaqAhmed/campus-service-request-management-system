const mongoose = require('mongoose');

const Comment = require('../models/Comment');
const Request = require('../models/Request');

const canAccessRequest = (request, user) => {
    if (user.role === 'admin') {
        return true;
    }

    if (
        user.role === 'student' &&
        request.createdBy.toString() === user.userId
    ) {
        return true;
    }

    if (
        user.role === 'staff' &&
        request.assignedTo &&
        request.assignedTo.toString() === user.userId
    ) {
        return true;
    }

    return false;
};

const getComments = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request ID'
            });
        }

        const request = await Request.findById(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Service request not found'
            });
        }

        if (!canAccessRequest(request, req.user)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view these comments'
            });
        }

        const comments = await Comment.find({
            request: id
        })
            .populate({
                path: 'user',
                select: 'name email role department'
            })
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            message: 'Comments retrieved successfully',
            data: {
                count: comments.length,
                comments
            }
        });
    } catch (error) {
        next(error);
    }
};

const createComment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request ID'
            });
        }

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Comment message is required'
            });
        }

        const request = await Request.findById(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Service request not found'
            });
        }

        if (!canAccessRequest(request, req.user)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to comment on this request'
            });
        }

        const comment = await Comment.create({
            request: id,
            user: req.user.userId,
            message: message.trim()
        });

        await comment.populate({
            path: 'user',
            select: 'name email role department'
        });

        return res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: {
                comment
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getComments,
    createComment
};
