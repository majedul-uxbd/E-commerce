const validateOrderStatus = (req, res, next) => {
    try {
        const { status } = req.body;

        console.log(`🔍 Validating order status: ${status}`);

        if (!status || status === '') {
            return res.status(400).send({
                status: "failed",
                message: "Order status is required"
            });
        }

        const validStatuses = ['pending', 'completed', 'cancelled'];
        const statusStr = String(status).toLowerCase().trim();

        if (!validStatuses.includes(statusStr)) {
            return res.status(400).send({
                status: "failed",
                message: `Invalid order status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        req.validatedStatus = statusStr;
        console.log(`✅ Order status validated successfully: ${statusStr}`);
        next();

    } catch (error) {
        console.error("❌ Error in order status validation:", error);
        return res.status(500).send({
            status: "failed",
            message: "Server error during status validation",
        });
    }
};

module.exports = validateOrderStatus;
