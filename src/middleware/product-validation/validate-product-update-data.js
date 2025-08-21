const validateProductUpdateData = async (req, res, next) => {
    try {
        const { name, description, price, stock_quantity } = req.body;

        // Check if at least one field is provided for update
        if (!name && !description && price === undefined && stock_quantity === undefined) {
            return res.status(400).send({
                status: "failed",
                message: "At least one field is required to update",
            });
        }

        // Validate name if provided
        if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
            return res.status(400).send({
                status: "failed",
                message: "Product name must be a valid string",
            });
        }

        // Validate description if provided
        if (description !== undefined && (typeof description !== "string" || description.trim().length === 0)) {
            return res.status(400).send({
                status: "failed",
                message: "Product description must be a valid string",
            });
        }

        // Validate price if provided
        if (price !== undefined && (typeof price !== "number" || price <= 0)) {
            return res.status(400).send({
                status: "failed",
                message: "Valid price is required (must be greater than 0)",
            });
        }

        // Validate stock quantity if provided
        if (stock_quantity !== undefined && (typeof stock_quantity !== "number" || stock_quantity < 0)) {
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
            message: "Server error during product update data validation",
        });
    }
};

module.exports = validateProductUpdateData;
