const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Request title is required'],
            trim: true,
            minlength: [5, 'Request title must be at least 5 characters long'],
            maxlength: [150, 'Request title cannot exceed 150 characters']
        },

        description: {
            type: String,
            required: [true, 'Request description is required'],
            trim: true,
            minlength: [10, 'Request description must be at least 10 characters long'],
            maxlength: [5000, 'Request description cannot exceed 5000 characters']
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Request category is required']
        },

        priority: {
            type: String,
            enum: {
                values: ['low', 'medium', 'high', 'urgent'],
                message: 'Invalid request priority'
            },
            default: 'medium'
        },

        status: {
            type: String,
            enum: {
                values: [
                    'open',
                    'assigned',
                    'in_progress',
                    'resolved',
                    'closed'
                ],
                message: 'Invalid request status'
            },
            default: 'open'
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Request creator is required']
        },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },

        assignmentHistory: [
            {
                from: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    default: null
                },

                to: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },

                changedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },

                changedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],

        location: {
            type: String,
            trim: true,
            maxlength: [200, 'Location cannot exceed 200 characters']
        },

        resolution: {
            type: String,
            trim: true,
            maxlength: [5000, 'Resolution cannot exceed 5000 characters']
        },

        resolvedAt: {
            type: Date,
            default: null
        },

        closedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

requestSchema.index({
    createdBy: 1,
    createdAt: -1
});

requestSchema.index({
    assignedTo: 1,
    status: 1
});

requestSchema.index({
    category: 1,
    status: 1
});

requestSchema.index({
    status: 1,
    priority: 1
});

module.exports = mongoose.model('Request', requestSchema);

