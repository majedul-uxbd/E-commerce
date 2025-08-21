const validateProductData = async (req, res, next) => {
    try {
        const { name, description, price, stock_quantity } = req.body;

        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return res.status(400).send({
                status: "failed",
                message: "Product name is required",
            });
        }

        if (!description || typeof description !== "string" || description.trim().length === 0) {
            return res.status(400).send({
                status: "failed",
                message: "Product description is required",
            });
        }

        if (!price || typeof price !== "number" || price <= 0) {
            return res.status(400).send({
                status: "failed",
                message: "Valid price is required (must be greater than 0)",
            });
        }

        if (stock_quantity === undefined || typeof stock_quantity !== "number" || stock_quantity < 0) {
            return res.status(400).send({
                status: "failed",
                message: "Valid stock quantity is required (must be 0 or greater)",
            });
        }

        // All validation passed, proceed to next middleware/controller
        next();
    } catch (error) {
        return res.status(500).send({
            status: "failed",
            message: "Server error during product data validation",
        });
    }
};

module.exports = validateProductData;
