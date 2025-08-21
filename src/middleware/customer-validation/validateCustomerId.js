const validateCustomerId = async (req, res, next) => {
    try {
        // Get customerId from different possible locations
        let customerId = req.body.customerId || req.params.customerId || req.params.id;

        // Check if customerId exists
        if (!customerId) {
            return res.status(400).send({
                status: "failed",
                message: "Customer ID is required",
            });
        }

        // Convert to number if it's a string
        if (typeof customerId === 'string') {
            customerId = parseInt(customerId, 10);
        }

        // Check if it's a valid number
        if (typeof customerId !== 'number' || isNaN(customerId)) {
            return res.status(400).send({
                status: "failed",
                message: "Customer ID must be a number",
            });
        }

        // Check if it's a positive integer
        if (customerId <= 0 || !Number.isInteger(customerId)) {
            return res.status(400).send({
                status: "failed",
                message: "Customer ID must be a positive integer",
            });
        }

        // Attach validated customerId to request object for use in controllers
        req.validatedCustomerId = customerId;

        next();
    } catch (error) {
        return res.status(500).send({
            status: "failed",
            message: "Server error during customer ID validation",
        });
    }
};

module.exports = validateCustomerId;
