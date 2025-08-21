const { pool } = require("../../DB/pool");

const validateUniqueProductName = async (req, res, next) => {
    try {
        const { name } = req.body;
        const productId = req.validatedProductId; // From validateProductId middleware

        // Only check if name is being updated
        if (!name) {
            return next();
        }

        const _query = `
            SELECT
                id
            FROM
                products
            WHERE
                name = ? AND id != ?
        `;

        const [rows] = await pool.query(_query, [name, productId]);

        if (rows.length > 0) {
            return res.status(400).send({
                status: "failed",
                message: "Product name already exists for another product",
            });
        }

        next();
    } catch (error) {
        return res.status(500).send({
            status: "failed",
            message: "Server error during product name validation",
        });
    }
};

module.exports = validateUniqueProductName;
