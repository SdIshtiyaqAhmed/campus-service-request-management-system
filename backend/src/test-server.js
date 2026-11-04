require('dotenv').config();

const app = require('./app');
const mongoose = require('mongoose');

const PORT = 5001;

const start = async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI, {
        serverSelectionTimeoutMS: 5000
    });

    console.log(
        `Test MongoDB connected: ${mongoose.connection.host}`
    );

    app.listen(PORT, '127.0.0.1', () => {
        console.log(
            `Test server running on http://127.0.0.1:${PORT}`
        );
    });
};

start().catch((error) => {
    console.error(`Test server startup failed: ${error.message}`);
    process.exit(1);
});
