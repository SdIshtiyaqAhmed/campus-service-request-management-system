const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
    {
        request: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Request',
            required: [true, 'Request is required'],
            unique: true
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Student is required']
        },
        rating: {
            type: Number,
            required: [true, 'Rating is required'],
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot exceed 5']
        },
        comment: {
            type: String,
            trim: true,
            maxlength: [2000, 'Feedback cannot exceed 2000 characters']
        }
    },
    {
        timestamps: true
    }
);

feedbackSchema.index({ student: 1, createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);