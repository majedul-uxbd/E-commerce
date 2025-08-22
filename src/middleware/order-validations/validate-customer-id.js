const validateCustomerId = (req, res, next) => {
    try {
        const customerId = req.params.customerId;

        console.log(`🔍 Validating customer ID: ${customerId}`);

        if (!customerId || customerId === '') {
            return res.status(400).send({
                status: "failed",
                message: "Customer ID is required"
            });
        }

        const customerIdStr = String(customerId).trim();

        if (customerIdStr.startsWith('-')) {
            return res.status(400).send({
                status: "failed",
                message: "Customer ID cannot be negative"
            });
        }

        if (!/^\d+$/.test(customerIdStr)) {
            return res.status(400).send({
                status: "failed",
                message: "Customer ID must contain only digits"
            });
        }

        const customerIdInt = parseInt(customerIdStr, 10);

        if (isNaN(customerIdInt) || customerIdInt < 1) {
            return res.status(400).send({
                status: "failed",
                message: "Customer ID must be a positive integer"
            });
        }

        req.validatedCustomerId = customerIdInt;
        console.log(`✅ Customer ID validated successfully: ${customerIdInt}`);
        next();

    } catch (error) {
        console.error("❌ Error in customer ID validation:", error);
        return res.status(500).send({
            status: "failed",
            message: "Server error during customer ID validation",
        });
    }
};

module.exports = validateCustomerId;
