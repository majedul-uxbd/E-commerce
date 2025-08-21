const validateProductId = async (req, res, next) => {
    try {
        // Get productId from different possible locations
        let productId = req.body.productId || req.params.productId || req.params.id;

        // Check if productId exists
        if (!productId) {
            return res.status(400).send({
                status: "failed",
                message: "Product ID is required",
            });
        }

        // Convert to number if it's a string
        if (typeof productId === 'string') {
            productId = parseInt(productId, 10);
        }

        // Check if it's a valid number
        if (typeof productId !== 'number' || isNaN(productId)) {
            return res.status(400).send({
                status: "failed",
                message: "Product ID must be a number",
            });
        }

        // Check if it's a positive integer
        if (productId <= 0 || !Number.isInteger(productId)) {
            return res.status(400).send({
                status: "failed",
                message: "Product ID must be a positive integer",
            });
        }

        // Attach validated productId to request object for use in controllers
        req.validatedProductId = productId;

        next();
    } catch (error) {
        return res.status(500).send({
            status: "failed",
            message: "Server error during product ID validation",
        });
    }
};

module.exports = validateProductId;
