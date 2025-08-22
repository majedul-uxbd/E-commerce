const validateCartPermission = async (req, res, next) => {
    try {
        const user = req.user;
        console.log("🔍 Debug - User from JWT:", user);

        // Check if user is admin
        if (user && user.role === 'admin') {
            console.log("✅ Admin access granted");
            return next();
        }

        // For customers, use customer_id from JWT token
        if (user && user.role === 'customer') {
            if (!user.customer_id) {
                console.log("❌ No customer_id in JWT token for user:", user.id);
                return res.status(400).send({
                    status: "failed",
                    message: "Invalid token: customer profile not found",
                });
            }

            // the customer's own ID from JWT token
            req.body.customer_id = user.customer_id;
            console.log("✅ customer_id from JWT:", user.customer_id);
            return next();
        }

        return res.status(403).send({
            status: "failed",
            message: "Access denied",
        });

    } catch (error) {
        console.error("❌ Unexpected error in permission validation:", error);
        return res.status(500).send({
            status: "failed",
            message: "Server error during permission validation",
        });
    }
};

module.exports = validateCartPermission;
