const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const testRoutes = require('./routes/test.routes');
const categoryRoutes = require('./routes/category.routes');
const requestRoutes = require('./routes/request.routes');
const commentRoutes = require('./routes/comment.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

app.use(helmet());

app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173'
    })
);

if (process.env.NODE_ENV !== 'test') {
    app.use(
        rateLimit({
            windowMs: 15 * 60 * 1000,
            limit: 100,
            standardHeaders: true,
            legacyHeaders: false
        })
    );
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Campus Service Management API'
    });
});

app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/test', testRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/requests', requestRoutes);
app.use('/api/v1', commentRoutes);
app.use('/api/v1', feedbackRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.use((error, req, res, _next) => {
    console.error(error);

    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(
            (validationError) => validationError.message
        );

        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: messages
        });
    }

    if (error.code === 11000) {
        return res.status(409).json({
            success: false,
            message: 'A record with the provided value already exists'
        });
    }

    return res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

module.exports = app;
