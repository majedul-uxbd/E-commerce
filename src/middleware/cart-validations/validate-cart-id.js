const validateCartId = (req, res, next) => {
    try {
        // Get cartId from different sources
        const cartId = req.body.cartId || req.params.cartId || req.query.cartId;

        // Check if cartId exists
        if (cartId === null || cartId === undefined || cartId === '') {
            return res.status(400).send({
                status: "failed",
                message: "Cart ID is required",
            });
        }

        // Convert to string for validation
        const cartIdStr = String(cartId).trim();

        // Check if empty after trimming
        if (cartIdStr === '') {
            return res.status(400).send({
                status: "failed",
                message: "Cart ID cannot be empty",
            });
        }

        // Check if it's a valid number
        if (!/^\d+$/.test(cartIdStr)) {
            return res.status(400).send({
                status: "failed",
                message: "Cart ID must be a valid number",
            });
        }

        // Convert to integer
        const cartIdInt = parseInt(cartIdStr, 10);

        // Security validations
        if (isNaN(cartIdInt)) {
            return res.status(400).send({
                status: "failed",
                message: "Cart ID must be a valid integer",
            });
        }

        // Check for negative numbers
        if (cartIdInt < 1) {
            return res.status(400).send({
                status: "failed",
                message: "Cart ID must be a positive integer",
            });
        }

        // Check for extremely large numbers (potential DoS attack)
        if (cartIdInt > Number.MAX_SAFE_INTEGER) {
            return res.status(400).send({
                status: "failed",
                message: "Cart ID is too large",
            });
        }

        // Check for reasonable upper limit (adjust based on your business needs)
        if (cartIdInt > 999999999) { // 9 digits max
            return res.status(400).send({
                status: "failed",
                message: "Invalid Cart ID range",
            });
        }

        // Security: Check for potential SQL injection attempts
        const dangerousPatterns = [
            /['"`;\\]/,  // SQL injection characters
            /union|select|insert|update|delete|drop|exec|script/i,  // SQL keywords
            /<script|javascript:|data:|vbscript:/i,  // XSS attempts
            /\.|\/|\\/  // Path traversal attempts
        ];

        for (const pattern of dangerousPatterns) {
            if (pattern.test(cartIdStr)) {
                console.warn(`🚨 Potential security threat detected in cartId: ${cartIdStr}`);
                return res.status(400).send({
                    status: "failed",
                    message: "Invalid Cart ID format",
                });
            }
        }

        // Store validated cartId in request object
        req.validatedCartId = cartIdInt;

        console.log(`✅ Cart ID validated successfully: ${cartIdInt}`);
        next();

    } catch (error) {
        console.error("❌ Error in cart ID validation:", error);
        return res.status(500).send({
            status: "failed",
            message: "Server error during cart ID validation",
        });
    }
};

module.exports = validateCartId;
