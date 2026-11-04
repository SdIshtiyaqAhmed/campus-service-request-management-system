const mongoose = require('mongoose');
const Request = require('../models/Request');
const User = require('../models/User');
const Category = require('../models/Category');

const assignRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { staffId } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request ID'
            });
        }

        if (!staffId || !mongoose.isValidObjectId(staffId)) {
            return res.status(400).json({
                success: false,
                message: 'A valid staff ID is required'
            });
        }

        const request = await Request.findById(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Service request not found'
            });
        }

        const allowedAssignmentStatuses = [
            'open',
            'assigned',
            'in_progress'
        ];

        if (!allowedAssignmentStatuses.includes(request.status)) {
            return res.status(400).json({
                success: false,
                message:
                    'Assignment can only be changed for open or active requests'
            });
        }

        const staff = await User.findOne({
            _id: staffId,
            role: 'staff',
            isActive: true
        });

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Active staff member not found'
            });
        }

        const previousStaffId = request.assignedTo || null;

        if (
            previousStaffId &&
            previousStaffId.toString() === staff._id.toString()
        ) {
            return res.status(400).json({
                success: false,
                message: 'This request is already assigned to this staff member'
            });
        }

        request.assignmentHistory.push({
            from: previousStaffId,
            to: staff._id,
            changedBy: req.user.userId,
            changedAt: new Date()
        });

        request.assignedTo = staff._id;
        request.status = 'assigned';

        await request.save();

        await request.populate([
            {
                path: 'category',
                select: 'name description'
            },
            {
                path: 'createdBy',
                select: 'name email role department'
            },
            {
                path: 'assignedTo',
                select: 'name email role department'
            }
        ]);

        return res.status(200).json({
            success: true,
            message: previousStaffId
                ? 'Service request reassigned successfully'
                : 'Service request assigned successfully',
            data: {
                request
            }
        });
    } catch (error) {
        next(error);
    }
};
const updateRequestStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, resolution } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request ID'
            });
        }

        const allowedStatuses = [
            'in_progress',
            'resolved'
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status transition'
            });
        }

        const request = await Request.findById(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Service request not found'
            });
        }

        if (
            !request.assignedTo ||
            request.assignedTo.toString() !== req.user.userId
        ) {
            return res.status(403).json({
                success: false,
                message: 'You are not assigned to this request'
            });
        }

        const validTransitions = {
            assigned: ['in_progress'],
            in_progress: ['resolved']
        };

        if (
            !validTransitions[request.status] ||
            !validTransitions[request.status].includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message: `Cannot change status from ${request.status} to ${status}`
            });
        }

        if (status === 'resolved') {
            if (!resolution || resolution.trim().length < 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Resolution details are required'
                });
            }

            request.resolution = resolution.trim();
            request.resolvedAt = new Date();
        }

        request.status = status;

        await request.save();

        await request.populate([
            {
                path: 'category',
                select: 'name description'
            },
            {
                path: 'createdBy',
                select: 'name email role department'
            },
            {
                path: 'assignedTo',
                select: 'name email role department'
            }
        ]);

        return res.status(200).json({
            success: true,
            message: 'Service request status updated successfully',
            data: {
                request
            }
        });
    } catch (error) {
        next(error);
    }
};

const closeRequest = async (req, res, next) => {
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

        if (request.createdBy.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only close your own requests'
            });
        }

        if (request.status !== 'resolved') {
            return res.status(400).json({
                success: false,
                message: 'Only resolved requests can be closed'
            });
        }

        request.status = 'closed';
        request.closedAt = new Date();

        await request.save();

        await request.populate([
            {
                path: 'category',
                select: 'name description'
            },
            {
                path: 'createdBy',
                select: 'name email role department'
            },
            {
                path: 'assignedTo',
                select: 'name email role department'
            }
        ]);

        return res.status(200).json({
            success: true,
            message: 'Service request closed successfully',
            data: {
                request
            }
        });
    } catch (error) {
        next(error);
    }
};

const getRequestScope = (user) => {
    if (user.role === 'student') {
        return {
            createdBy: user.userId
        };
    }

    if (user.role === 'staff') {
        return {
            assignedTo: user.userId
        };
    }

    return {};
};

const createRequest = async (req, res, next) => {
    try {
        const {
            title,
            description,
            category,
            priority,
            location
        } = req.body;

        if (!title || !description || !category) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, and category are required'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID'
            });
        }

        const categoryExists = await Category.findOne({
            _id: category,
            isActive: true
        });

        if (!categoryExists) {
            return res.status(400).json({
                success: false,
                message: 'Selected category does not exist or is inactive'
            });
        }

        const request = await Request.create({
            title: title.trim(),
            description: description.trim(),
            category,
            priority: priority || 'medium',
            location: location ? location.trim() : undefined,
            createdBy: req.user.userId
        });

        const populatedRequest = await Request.findById(request._id)
            .populate('category', 'name description')
            .populate('createdBy', 'name email role department');

        return res.status(201).json({
            success: true,
            message: 'Service request created successfully',
            data: {
                request: populatedRequest
            }
        });
    } catch (error) {
        next(error);
    }
};

const getRequests = async (req, res, next) => {
    try {
        const {
            status,
            priority,
            category
        } = req.query;

        const filter = getRequestScope(req.user);

        if (status) {
            filter.status = status;
        }

        if (priority) {
            filter.priority = priority;
        }

        if (category) {
            if (!mongoose.Types.ObjectId.isValid(category)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category ID'
                });
            }

            filter.category = category;
        }

        const requests = await Request.find(filter)
            .populate('category', 'name')
            .populate('createdBy', 'name email role')
            .populate('assignedTo', 'name email role department')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: 'Service requests retrieved successfully',
            data: {
                count: requests.length,
                requests
            }
        });
    } catch (error) {
        next(error);
    }
};

const getRequestById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request ID'
            });
        }

        const request = await Request.findById(id)
            .populate('category', 'name description')
            .populate('createdBy', 'name email role department')
            .populate('assignedTo', 'name email role department');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Service request not found'
            });
        }

        const isOwner =
            req.user.role === 'student' &&
            request.createdBy._id.toString() === req.user.userId;

        const isAssignedStaff =
            req.user.role === 'staff' &&
            request.assignedTo &&
            request.assignedTo._id.toString() === req.user.userId;

        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAssignedStaff && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view this request'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Service request retrieved successfully',
            data: {
                request
            }
        });
    } catch (error) {
        next(error);
    }
};

const updateRequest = async (req, res, next) => {
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
                message: 'Service request not found'
            });
        }

        const isOwner =
            req.user.role === 'student' &&
            request.createdBy.toString() === req.user.userId;

        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to update this request'
            });
        }

        if (request.status !== 'open' && req.user.role === 'student') {
            return res.status(400).json({
                success: false,
                message: 'Requests can only be edited while they are open'
            });
        }

        const {
            title,
            description,
            category,
            priority,
            location
        } = req.body;

        if (category !== undefined) {
            if (!mongoose.Types.ObjectId.isValid(category)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category ID'
                });
            }

            const categoryExists = await Category.findOne({
                _id: category,
                isActive: true
            });

            if (!categoryExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Selected category does not exist or is inactive'
                });
            }

            request.category = category;
        }

        if (title !== undefined) {
            request.title = title.trim();
        }

        if (description !== undefined) {
            request.description = description.trim();
        }

        if (priority !== undefined) {
            request.priority = priority;
        }

        if (location !== undefined) {
            request.location = location.trim();
        }

        await request.save();

        const updatedRequest = await Request.findById(request._id)
            .populate('category', 'name description')
            .populate('createdBy', 'name email role department')
            .populate('assignedTo', 'name email role department');

        return res.status(200).json({
            success: true,
            message: 'Service request updated successfully',
            data: {
                request: updatedRequest
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createRequest,
    getRequests,
    getRequestById,
    updateRequest,
    assignRequest,
    updateRequestStatus,
    closeRequest
};


