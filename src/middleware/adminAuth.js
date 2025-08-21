const adminAuth = async (req, res, next) => {
    try {
        // Check if user exists in req (should be set by jwtAuth middleware)
        if (!req.user) {
            return res.status(401).send({
                status: "failed",
                message: "Authentication required",
            });
        }

        // Check if user has admin role
        if (req.user.role !== 'admin') {
            return res.status(403).send({
                status: "failed",
                message: "Access denied. Admin role required.",
            });
        }

        // User is admin, proceed to next middleware/controller
        next();
    } catch (error) {
        return res.status(500).send({
            status: "failed",
            message: "Server error during authorization",
        });
    }
};

module.exports = adminAuth;
