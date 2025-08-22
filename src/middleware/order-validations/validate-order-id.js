const validateOrderId = (req, res, next) => {
    try {
        const orderId = req.params.id;

        console.log(`🔍 Validating order ID: ${orderId}`);

        if (!orderId || orderId === '') {
            return res.status(400).send({
                status: "failed",
                message: "Order ID is required",
                code: "ORDER_ID_MISSING"
            });
        }

        const orderIdStr = String(orderId).trim();

        if (orderIdStr.startsWith('-')) {
            return res.status(400).send({
                status: "failed",
                message: "Order ID cannot be negative",
                code: "ORDER_ID_NEGATIVE"
            });
        }

        if (!/^\d+$/.test(orderIdStr)) {
            return res.status(400).send({
                status: "failed",
                message: "Order ID must contain only digits",
                code: "ORDER_ID_INVALID_FORMAT"
            });
        }

        const orderIdInt = parseInt(orderIdStr, 10);

        if (isNaN(orderIdInt) || orderIdInt < 1) {
            return res.status(400).send({
                status: "failed",
                message: "Order ID must be a positive integer",
                code: "ORDER_ID_INVALID"
            });
        }

        if (orderIdInt > 999999999) {
            return res.status(400).send({
                status: "failed",
                message: "Order ID exceeds maximum allowed value",
                code: "ORDER_ID_TOO_LARGE"
            });
        }

        req.validatedOrderId = orderIdInt;
        console.log(`✅ Order ID validated successfully: ${orderIdInt}`);
        next();

    } catch (error) {
        console.error("❌ Error in order ID validation:", error);
        return res.status(500).send({
            status: "failed",
            message: "Server error during order ID validation",
        });
    }
};

module.exports = validateOrderId;
