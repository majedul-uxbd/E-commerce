const validateQuantity = (req, res, next) => {
    try {
        const { quantity } = req.body;

        console.log(`🔍 Validating quantity: ${quantity} (type: ${typeof quantity})`);

        // Check if quantity exists
        if (quantity === null || quantity === undefined || quantity === '') {
            return res.status(400).send({
                status: "failed",
                message: "Quantity is required",
                code: "QUANTITY_MISSING"
            });
        }

        // Type validation - must be number or string that represents a number
        if (typeof quantity === 'string') {
            const trimmedQuantity = quantity.trim();

            // Check if empty after trimming
            if (trimmedQuantity === '') {
                return res.status(400).send({
                    status: "failed",
                    message: "Quantity cannot be empty",
                    code: "QUANTITY_EMPTY"
                });
            }

            // Check for negative sign
            if (trimmedQuantity.startsWith('-')) {
                return res.status(400).send({
                    status: "failed",
                    message: "Quantity cannot be negative",
                    code: "QUANTITY_NEGATIVE"
                });
            }

            // Check if string contains only digits (no decimals allowed)
            if (!/^\d+$/.test(trimmedQuantity)) {
                return res.status(400).send({
                    status: "failed",
                    message: "Quantity must contain only digits (no decimals or special characters)",
                    code: "QUANTITY_INVALID_CHARACTERS"
                });
            }

            // Convert string to number
            const quantityNum = parseInt(trimmedQuantity, 10);

            // Validate conversion
            if (isNaN(quantityNum)) {
                return res.status(400).send({
                    status: "failed",
                    message: "Quantity must be a valid integer",
                    code: "QUANTITY_NAN"
                });
            }

            // Replace the string with validated number
            req.body.quantity = quantityNum;

        } else if (typeof quantity === 'number') {
            // Check if it's NaN
            if (isNaN(quantity)) {
                return res.status(400).send({
                    status: "failed",
                    message: "Quantity cannot be NaN",
                    code: "QUANTITY_NAN"
                });
            }

            // Check if it's not finite (Infinity, -Infinity)
            if (!isFinite(quantity)) {
                return res.status(400).send({
                    status: "failed",
                    message: "Quantity must be a finite number",
                    code: "QUANTITY_NOT_FINITE"
                });
            }

            // Check if it's an integer
            if (!Number.isInteger(quantity)) {
                return res.status(400).send({
                    status: "failed",
                    message: "Quantity must be an integer (no decimals allowed)",
                    code: "QUANTITY_NOT_INTEGER"
                });
            }

            // Check for negative numbers
            if (quantity < 0) {
                return res.status(400).send({
                    status: "failed",
                    message: "Quantity cannot be negative",
                    code: "QUANTITY_NEGATIVE"
                });
            }

        } else {
            // Invalid type (boolean, object, array, etc.)
            return res.status(400).send({
                status: "failed",
                message: "Quantity must be a number or numeric string",
                code: "QUANTITY_INVALID_TYPE"
            });
        }

        // At this point, quantity is guaranteed to be a positive integer
        const quantityValue = req.body.quantity;

        // Check for zero
        if (quantityValue === 0) {
            return res.status(400).send({
                status: "failed",
                message: "Quantity must be greater than 0",
                code: "QUANTITY_ZERO"
            });
        }

        // Check for reasonable limits (business rule)
        if (quantityValue > 100) {
            return res.status(400).send({
                status: "failed",
                message: "Quantity cannot exceed 100 items per request",
                code: "QUANTITY_EXCEEDS_LIMIT"
            });
        }

        // Check for extremely large numbers (potential DoS attack)
        if (quantityValue > Number.MAX_SAFE_INTEGER) {
            return res.status(400).send({
                status: "failed",
                message: "Quantity exceeds safe integer range",
                code: "QUANTITY_UNSAFE_INTEGER"
            });
        }

        // Security check for suspicious patterns
        const quantityStr = String(quantityValue);
        if (/(.)\1{3,}/.test(quantityStr)) { // Repeated digits like 1111
            console.warn(`🚨 Suspicious quantity pattern: ${quantityStr}`);
            return res.status(400).send({
                status: "failed",
                message: "Invalid quantity pattern",
                code: "QUANTITY_SUSPICIOUS_PATTERN"
            });
        }

        // Additional business validation
        if (quantityValue > 50) {
            console.log(`⚠️ Large quantity requested: ${quantityValue} - flagged for review`);
            // You could add additional logging or alerts here
        }

        console.log(`✅ Quantity validated successfully: ${quantityValue}`);
        next();

    } catch (error) {
        console.error("❌ Error in quantity validation:", error);
        return res.status(500).send({
            status: "failed",
            message: "Server error during quantity validation",
            code: "QUANTITY_VALIDATION_SERVER_ERROR"
        });
    }
};

module.exports = validateQuantity;
