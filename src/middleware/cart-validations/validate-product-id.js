const { pool } = require("../../DB/pool");

const validateProductId = async (req, res, next) => {
    try {
        const { product_id } = req.body;

        console.log(`🔍 Validating product_id: ${product_id} (type: ${typeof product_id})`);

        // Check if product_id exists
        if (product_id === null || product_id === undefined || product_id === '') {
            return res.status(400).send({
                status: "failed",
                message: "Product ID is required",
                code: "PRODUCT_ID_MISSING"
            });
        }

        // Type validation - must be number or string that represents a number
        if (typeof product_id === 'string') {
            const trimmedId = product_id.trim();

            // Check if empty after trimming
            if (trimmedId === '') {
                return res.status(400).send({
                    status: "failed",
                    message: "Product ID cannot be empty",
                    code: "PRODUCT_ID_EMPTY"
                });
            }

            // Check for negative sign
            if (trimmedId.startsWith('-')) {
                return res.status(400).send({
                    status: "failed",
                    message: "Product ID cannot be negative",
                    code: "PRODUCT_ID_NEGATIVE"
                });
            }

            // Check if string contains only digits
            if (!/^\d+$/.test(trimmedId)) {
                return res.status(400).send({
                    status: "failed",
                    message: "Product ID must contain only digits",
                    code: "PRODUCT_ID_INVALID_CHARACTERS"
                });
            }

            // Convert string to number
            const productIdNum = parseInt(trimmedId, 10);

            // Validate conversion
            if (isNaN(productIdNum)) {
                return res.status(400).send({
                    status: "failed",
                    message: "Product ID must be a valid integer",
                    code: "PRODUCT_ID_NAN"
                });
            }

            // Replace the string with validated number
            req.body.product_id = productIdNum;

        } else if (typeof product_id === 'number') {
            // Check if it's NaN
            if (isNaN(product_id)) {
                return res.status(400).send({
                    status: "failed",
                    message: "Product ID cannot be NaN",
                    code: "PRODUCT_ID_NAN"
                });
            }

            // Check if it's not finite (Infinity, -Infinity)
            if (!isFinite(product_id)) {
                return res.status(400).send({
                    status: "failed",
                    message: "Product ID must be a finite number",
                    code: "PRODUCT_ID_NOT_FINITE"
                });
            }

            // Check if it's an integer
            if (!Number.isInteger(product_id)) {
                return res.status(400).send({
                    status: "failed",
                    message: "Product ID must be an integer (no decimals allowed)",
                    code: "PRODUCT_ID_NOT_INTEGER"
                });
            }

            // Check for negative numbers
            if (product_id < 0) {
                return res.status(400).send({
                    status: "failed",
                    message: "Product ID cannot be negative",
                    code: "PRODUCT_ID_NEGATIVE"
                });
            }

        } else {
            // Invalid type (boolean, object, array, etc.)
            return res.status(400).send({
                status: "failed",
                message: "Product ID must be a number or numeric string",
                code: "PRODUCT_ID_INVALID_TYPE"
            });
        }

        // At this point, product_id is guaranteed to be a positive integer
        const productId = req.body.product_id;

        // Check for zero
        if (productId === 0) {
            return res.status(400).send({
                status: "failed",
                message: "Product ID must be greater than 0",
                code: "PRODUCT_ID_ZERO"
            });
        }

        // Check for reasonable upper limit
        if (productId > 999999999) {
            return res.status(400).send({
                status: "failed",
                message: "Product ID exceeds maximum allowed value (999999999)",
                code: "PRODUCT_ID_TOO_LARGE"
            });
        }

        // Check for extremely large numbers (potential DoS attack)
        if (productId > Number.MAX_SAFE_INTEGER) {
            return res.status(400).send({
                status: "failed",
                message: "Product ID exceeds safe integer range",
                code: "PRODUCT_ID_UNSAFE_INTEGER"
            });
        }

        // Security check for suspicious patterns
        const productIdStr = String(productId);
        if (/(.)\1{5,}/.test(productIdStr)) { // Repeated digits like 111111
            console.warn(`🚨 Suspicious product ID pattern: ${productIdStr}`);
            return res.status(400).send({
                status: "failed",
                message: "Invalid Product ID pattern",
                code: "PRODUCT_ID_SUSPICIOUS_PATTERN"
            });
        }

        // Check if product exists in database
        const _query = `SELECT id, stock_quantity, name, price FROM products WHERE id = ?`;
        const [rows] = await pool.query(_query, [productId]);

        if (rows.length === 0) {
            return res.status(404).send({
                status: "failed",
                message: "Product not found",
                code: "PRODUCT_NOT_FOUND"
            });
        }

        // Store validated product info
        req.validatedProduct = rows[0];

        console.log(`✅ Product ID validated successfully: ${productId}`);
        next();

    } catch (error) {
        console.error("❌ Error in product ID validation:", error);
        return res.status(500).send({
            status: "failed",
            message: "Server error during product validation",
            code: "PRODUCT_VALIDATION_SERVER_ERROR"
        });
    }
};

module.exports = validateProductId;
