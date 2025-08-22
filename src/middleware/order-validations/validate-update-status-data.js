const validateUpdateStatusData = (req, res, next) => {
    try {
        const { order_id, status } = req.body;

        console.log(`🔍 Validating update status data - order_id: ${order_id}, status: ${status}`);

        // ========== ORDER_ID VALIDATION ==========
        if (!order_id) {
            return res.status(400).send({
                status: "failed",
                message: "Order ID is required",
                code: "ORDER_ID_MISSING"
            });
        }

        if (typeof order_id === 'string') {
            const trimmedId = order_id.trim();

            if (trimmedId === '' || trimmedId.startsWith('-')) {
                return res.status(400).send({
                    status: "failed",
                    message: "Order ID must be a positive integer",
                    code: "ORDER_ID_INVALID"
                });
            }

            if (!/^\d+$/.test(trimmedId)) {
                return res.status(400).send({
                    status: "failed",
                    message: "Order ID must contain only digits",
                    code: "ORDER_ID_INVALID_FORMAT"
                });
            }

            const orderIdNum = parseInt(trimmedId, 10);
            if (isNaN(orderIdNum) || orderIdNum < 1) {
                return res.status(400).send({
                    status: "failed",
                    message: "Order ID must be a positive integer",
                    code: "ORDER_ID_INVALID"
                });
            }
            req.body.order_id = orderIdNum;
        } else if (typeof order_id === 'number') {
            if (!Number.isInteger(order_id) || order_id < 1) {
                return res.status(400).send({
                    status: "failed",
                    message: "Order ID must be a positive integer",
                    code: "ORDER_ID_INVALID"
                });
            }
        } else {
            return res.status(400).send({
                status: "failed",
                message: "Order ID must be a number",
                code: "ORDER_ID_INVALID_TYPE"
            });
        }

        // ========== STATUS VALIDATION ==========
        if (!status || status === '') {
            return res.status(400).send({
                status: "failed",
                message: "Order status is required",
                code: "STATUS_MISSING"
            });
        }

        const validStatuses = ['pending', 'completed', 'cancelled'];
        const statusStr = String(status).toLowerCase().trim();

        if (!validStatuses.includes(statusStr)) {
            return res.status(400).send({
                status: "failed",
                message: `Invalid order status. Must be one of: ${validStatuses.join(', ')}`,
                code: "INVALID_STATUS"
            });
        }

        // Store validated data
        req.validatedOrderId = req.body.order_id;
        req.validatedStatus = statusStr;

        console.log(`✅ Update status data validated successfully - Order: ${req.validatedOrderId}, Status: ${statusStr}`);
        next();

    } catch (error) {
        console.error("❌ Error in update status data validation:", error);
        return res.status(500).send({
            status: "failed",
            message: "Server error during validation",
        });
    }
};

module.exports = validateUpdateStatusData;
