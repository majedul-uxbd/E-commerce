const { pool } = require("../../DB/pool");

const validateOrderOwnership = async (req, res, next) => {
    try {
        const user = req.user;
        const orderId = req.validatedOrderId;

        console.log(`🔍 Checking order ownership for order: ${orderId}`);

        // Check if order exists and get owner
        const _query = `SELECT id, customer_id, status FROM orders WHERE id = ?`;
        const [rows] = await pool.query(_query, [orderId]);

        if (rows.length === 0) {
            return res.status(404).send({
                status: "failed",
                message: "Order not found",
            });
        }

        const orderData = rows[0];
        req.orderData = orderData;

        // Check if user is admin
        if (user && user.role === 'admin') {
            console.log("✅ Admin access granted for order operation");
            return next();
        }

        // For customers, check ownership
        if (user && user.role === 'customer') {
            if (!user.customer_id) {
                return res.status(400).send({
                    status: "failed",
                    message: "Invalid token: customer profile not found",
                });
            }

            if (user.customer_id === orderData.customer_id) {
                console.log("✅ Order ownership verified for customer:", user.customer_id);
                return next();
            } else {
                return res.status(403).send({
                    status: "failed",
                    message: "You can only access your own orders",
                });
            }
        }

        return res.status(403).send({
            status: "failed",
            message: "Access denied",
        });

    } catch (error) {
        console.error("Error during order ownership validation:", error);
        return res.status(500).send({
            status: "failed",
            message: "Server error during order ownership validation",
        });
    }
};

module.exports = validateOrderOwnership;
