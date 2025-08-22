const { pool } = require("../../DB/pool");

const validateCartOwnership = async (req, res, next) => {
    try {
        const user = req.user;
        const cartId = req.validatedCartId || req.body.cartId || req.params.cartId || req.query.cartId;

        if (!cartId) {
            return res.status(400).send({
                status: "failed",
                message: "Cart ID is required",
            });
        }

        // Check if cart exists and get full cart data
        const _query = `SELECT id, customer_id FROM carts WHERE id = ?`;
        const [rows] = await pool.query(_query, [cartId]);

        if (rows.length === 0) {
            return res.status(404).send({
                status: "failed",
                message: "Cart item not found",
            });
        }

        const cartData = rows[0];
        const cartOwnerCustomerId = cartData.customer_id;

        // Store cart data in request for use in the route handler
        req.cartData = cartData;

        // Check if user is admin
        if (user && user.role === 'admin') {
            console.log("✅ Admin access granted for cart operation");
            return next();
        }

        // For customers, use customer_id from JWT token
        if (user && user.role === 'customer') {
            if (!user.customer_id) {
                console.log("❌ No customer_id in JWT token");
                return res.status(400).send({
                    status: "failed",
                    message: "Invalid token: customer profile not found",
                });
            }

            // Check if the cart belongs to this customer
            if (user.customer_id === cartOwnerCustomerId) {
                console.log("✅ Cart ownership verified for customer:", user.customer_id);
                return next();
            } else {
                console.log(`❌ Cart ownership mismatch. User: ${user.customer_id}, Cart Owner: ${cartOwnerCustomerId}`);
                return res.status(403).send({
                    status: "failed",
                    message: "You can only access your own cart items",
                });
            }
        }

        return res.status(403).send({
            status: "failed",
            message: "Access denied",
        });

    } catch (error) {
        console.error("Error during cart ownership validation:", error);
        return res.status(500).send({
            status: "failed",
            message: "Server error during cart ownership validation",
        });
    }
};

module.exports = validateCartOwnership;
