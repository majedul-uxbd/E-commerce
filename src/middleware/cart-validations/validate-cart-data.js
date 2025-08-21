const validateCartData = async (req, res, next) => {
    try {
        const { customer_id, product_id, quantity } = req.body;

        if (!customer_id) {
            return res.status(400).send({
                status: "failed",
                message: "Customer ID is required",
            });
        }

        if (!product_id) {
            return res.status(400).send({
                status: "failed",
                message: "Product ID is required",
            });
        }

        if (!quantity || typeof quantity !== "number" || quantity <= 0) {
            return res.status(400).send({
                status: "failed",
                message: "Valid quantity is required (must be greater than 0)",
            });
        }

        next();
    } catch (error) {
        return res.status(500).send({
            status: "failed",
            message: "Server error during cart data validation",
        });
    }
};

module.exports = validateCartData;
