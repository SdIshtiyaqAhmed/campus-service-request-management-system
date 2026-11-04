const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
    {
        request: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Request',
            required: [true, 'Request is required']
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Comment author is required']
        },
        message: {
            type: String,
            required: [true, 'Comment message is required'],
            trim: true,
            minlength: [1, 'Comment cannot be empty'],
            maxlength: [2000, 'Comment cannot exceed 2000 characters']
        }
    },
    {
        timestamps: true
    }
);

commentSchema.index({
    request: 1,
    createdAt: 1
});

module.exports = mongoose.model('Comment', commentSchema);
