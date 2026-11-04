const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    try {
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const [scheme, token] = authorizationHeader.split(' ');

        if (scheme !== 'Bearer' || !token) {
            return res.status(401).json({
                success: false,
                message: 'Invalid authorization format'
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();
    } catch {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired authentication token'
        });
    }
};

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to perform this action'
            });
        }

        next();
    };
};

module.exports = {
    authenticate,
    authorize
};
