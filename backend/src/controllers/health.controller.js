const getHealth = (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Campus Service Management API is running',
        data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV
        }
    });
};

module.exports = {
    getHealth
};
