const { pool } = require("../../DB/pool");

const validateCreateOrderData = async (req, res, next) => {
    try {
        const { cartIds } = req.body;

        console.log(`🔍 Validating order data - cartIds:`, cartIds);

        // ========== CART_IDS VALIDATION ==========
        if (!cartIds || !Array.isArray(cartIds) || cartIds.length === 0) {
            return res.status(400).send({
                status: "failed",
                message: "Cart IDs are required (must be a non-empty array)",
                code: "INVALID_CART_IDS"
            });
        }

        if (cartIds.length > 50) {
            return res.status(400).send({
                status: "failed",
                message: "Cannot process more than 50 cart items at once",
                code: "TOO_MANY_CART_ITEMS"
            });
        }

        // Validate each cart ID
        const validatedCartIds = [];
        for (let i = 0; i < cartIds.length; i++) {
            const cartId = cartIds[i];

            if (!Number.isInteger(cartId) || cartId <= 0) {
                return res.status(400).send({
                    status: "failed",
                    message: `Invalid cart ID at index ${i}: must be a positive integer`,
                    code: "INVALID_CART_ID"
                });
            }

            validatedCartIds.push(cartId);
        }

        // Remove duplicates
        const uniqueCartIds = [...new Set(validatedCartIds)];

        // Check if all cart items exist and belong to the customer
        const cartQuery = `
            SELECT 
                c.id,
                c.customer_id,
                c.product_id,
                c.quantity,
                p.name as product_name,
                p.price as product_price,
                p.stock_quantity
            FROM carts c
            JOIN products p ON c.product_id = p.id
            WHERE c.id IN (${uniqueCartIds.map(() => '?').join(',')}) 
            AND c.customer_id = ?
        `;

        const [cartRows] = await pool.query(cartQuery, [...uniqueCartIds, req.validatedCustomerId]);

        if (cartRows.length !== uniqueCartIds.length) {
            return res.status(404).send({
                status: "failed",
                message: "Some cart items not found or don't belong to you",
                code: "CART_ITEMS_NOT_FOUND"
            });
        }

        // ========== STOCK VALIDATION ==========
        const validatedItems = [];
        let totalAmount = 0;

        for (const cartItem of cartRows) {
            if (cartItem.stock_quantity < cartItem.quantity) {
                return res.status(400).send({
                    status: "failed",
                    message: `Insufficient stock for ${cartItem.product_name}. Available: ${cartItem.stock_quantity}, In cart: ${cartItem.quantity}`,
                    code: "INSUFFICIENT_STOCK"
                });
            }

            const itemTotal = parseFloat(cartItem.product_price) * cartItem.quantity;
            totalAmount += itemTotal;

            validatedItems.push({
                cart_id: cartItem.id,
                product_id: cartItem.product_id,
                quantity: cartItem.quantity,
                unit_price: parseFloat(cartItem.product_price),
                total_price: itemTotal,
                product_name: cartItem.product_name
            });
        }

        // Store validated data
        req.validatedOrderData = {
            customer_id: req.validatedCustomerId,
            cartIds: uniqueCartIds,
            items: validatedItems,
            total_amount: parseFloat(totalAmount.toFixed(2))
        };

        console.log(`✅ Order data validated successfully - Total: $${totalAmount.toFixed(2)}`);
        next();

    } catch (error) {
        console.error("❌ Error in order data validation:", error);
        return res.status(500).send({
            status: "failed",
            message: "Server error during order validation",
            code: "ORDER_VALIDATION_ERROR"
        });
    }
};

module.exports = validateCreateOrderData;
