const mongoose = require('mongoose');

const Feedback = require('../models/Feedback');
const Request = require('../models/Request');

const createFeedback = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request ID'
            });
        }

        const numericRating = Number(rating);

        if (
            !Number.isInteger(numericRating) ||
            numericRating < 1 ||
            numericRating > 5
        ) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be an integer between 1 and 5'
            });
        }

        const request = await Request.findById(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        if (request.createdBy.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only submit feedback for your own requests'
            });
        }

        if (!['resolved', 'closed'].includes(request.status)) {
            return res.status(400).json({
                success: false,
                message: 'Feedback can only be submitted for resolved or closed requests'
            });
        }

        const existingFeedback = await Feedback.findOne({
            request: request._id
        });

        if (existingFeedback) {
            return res.status(409).json({
                success: false,
                message: 'Feedback has already been submitted for this request'
            });
        }

        const feedback = await Feedback.create({
            request: request._id,
            student: req.user.userId,
            rating: numericRating,
            comment: comment ? comment.trim() : undefined
        });

        await feedback.populate([
            {
                path: 'student',
                select: 'name email role department'
            },
            {
                path: 'request',
                select: 'title status priority'
            }
        ]);

        return res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            data: {
                feedback
            }
        });
    } catch (error) {
        return next(error);
    }
};

const getRequestFeedback = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request ID'
            });
        }

        const request = await Request.findById(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        const isAdmin = req.user.role === 'admin';

        const isOwner =
            req.user.role === 'student' &&
            request.createdBy.toString() === req.user.userId;

        const isAssignedStaff =
            req.user.role === 'staff' &&
            request.assignedTo &&
            request.assignedTo.toString() === req.user.userId;

        if (!isAdmin && !isOwner && !isAssignedStaff) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view this feedback'
            });
        }

        const feedback = await Feedback.findOne({
            request: request._id
        }).populate([
            {
                path: 'student',
                select: 'name email role department'
            },
            {
                path: 'request',
                select: 'title status priority'
            }
        ]);

        return res.status(200).json({
            success: true,
            data: {
                feedback
            }
        });
    } catch (error) {
        return next(error);
    }
};

const getFeedback = async (req, res, next) => {
    try {
        const feedback = await Feedback.find()
            .populate('student', 'name email role department')
            .populate('request', 'title status priority')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: {
                feedback
            }
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    createFeedback,
    getRequestFeedback,
    getFeedback
};
