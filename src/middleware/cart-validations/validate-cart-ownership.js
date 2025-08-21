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

        // Check if cart exists and get owner
        const _query = `SELECT customer_id FROM carts WHERE id = ?`;
        const [rows] = await pool.query(_query, [cartId]);

        if (rows.length === 0) {
            return res.status(404).send({
                status: "failed",
                message: "Cart item not found",
            });
        }

        const cartOwnerCustomerId = rows[0].customer_id;

        // Check if user is admin
        if (user && user.role === 'admin') {
            return next();
        }

        // For customers, check if they own this cart item
        if (user && user.role === 'customer') {
            // Get user's customer_id from customers table
            const customerQuery = `SELECT id FROM customers WHERE user_id = ?`;
            const [customerRows] = await pool.query(customerQuery, [user.id]);

            if (customerRows.length === 0) {
                return res.status(404).send({
                    status: "failed",
                    message: "Customer record not found",
                });
            }

            const userCustomerId = customerRows[0].id;

            // Check if the cart belongs to this customer
            if (userCustomerId === cartOwnerCustomerId) {
                return next();
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
