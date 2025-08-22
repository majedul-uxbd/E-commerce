const validateGetOrdersData = (req, res, next) => {
    try {
        const { customer_id } = req.body;

        console.log(`🔍 Validating get orders data - customer_id: ${customer_id}`);

        // For customers, use their own customer_id from JWT (already set by validateOrderPermission)
        // For admins, they can specify customer_id in body or use their permission to see all

        if (req.user.role === 'customer') {
            // Use customer_id from JWT token (already validated by validateOrderPermission)
            req.validatedCustomerId = req.validatedCustomerId; // Already set by validateOrderPermission
            console.log(`✅ Using customer_id from JWT: ${req.validatedCustomerId}`);
            return next();
        }

        if (req.user.role === 'admin') {
            if (customer_id) {
                // Admin wants to see specific customer's orders
                if (!Number.isInteger(customer_id) || customer_id <= 0) {
                    return res.status(400).send({
                        status: "failed",
                        message: "Valid Customer ID is required",
                        code: "INVALID_CUSTOMER_ID"
                    });
                }
                req.validatedCustomerId = customer_id;
            } else {
                // Admin wants to see all orders (you can implement this separately)
                return res.status(400).send({
                    status: "failed",
                    message: "Customer ID is required for admin requests",
                    code: "CUSTOMER_ID_REQUIRED"
                });
            }
            console.log(`✅ Admin requesting customer_id: ${req.validatedCustomerId}`);
            return next();
        }

        return res.status(403).send({
            status: "failed",
            message: "Access denied",
        });

    } catch (error) {
        console.error("❌ Error in get orders data validation:", error);
        return res.status(500).send({
            status: "failed",
            message: "Server error during validation",
        });
    }
};

module.exports = validateGetOrdersData;
