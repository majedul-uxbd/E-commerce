const { pool } = require("../../DB/pool");

const validateCartPermission = async (req, res, next) => {
    try {
        const user = req.user;

        console.log("🔍 Debug - User from JWT:", user);

        // Check if user is admin
        if (user && user.role === 'admin') {
            console.log("✅ Admin access granted");
            return next();
        }

        // For customers, auto-assign their customer_id
        if (user && user.role === 'customer') {
            try {
                const _query = `SELECT id FROM customers WHERE user_id = ?`;
                const [rows] = await pool.query(_query, [user.id]);

                if (rows.length === 0) {
                    console.log("❌ No customer record found for user_id:", user.id);
                    return res.status(404).send({
                        status: "failed",
                        message: "Customer record not found",
                    });
                }

                // Auto-assign the customer's own ID - no need for validation
                req.body.customer_id = rows[0].id;
                console.log("✅ Auto-assigned customer_id:", rows.id);
                return next();
            } catch (dbError) {
                console.error("❌ Database error during permission check:", dbError);
                return res.status(500).send({
                    status: "failed",
                    message: "Server error during permission validation",
                });
            }
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
