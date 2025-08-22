const { pool } = require("../../DB/pool");

const fetchCustomerCartItems = async (customerId) => {
    const _query = `
        SELECT 
            c.id as cart_id,
            c.customer_id,
            c.product_id,
            c.quantity,
            c.created_at,
            c.updated_at,
            p.name as product_name,
            p.description as product_description,
            p.price as product_price,
            p.stock_quantity as available_stock,
            (c.quantity * p.price) as total_item_price
        FROM 
            carts c
        JOIN 
            products p ON c.product_id = p.id
        WHERE 
            c.customer_id = ?
        ORDER BY c.created_at DESC
    `;

    try {
        const [rows] = await pool.query(_query, [customerId]);
        return rows || [];
    } catch (error) {
        return Promise.reject(error);
    }
};

/**
 * @param {*} requestData 
 * @description Gets all cart items for a customer
 * @returns {Promise} Resolves with cart items or rejects with error message 
 */
const getCustomerCartItems = async (requestData) => {
    const { customerId, user } = requestData;

    try {
        const cartItems = await fetchCustomerCartItems(customerId);

        if (cartItems.length === 0) {
            return Promise.resolve({
                status: "success",
                message: "Cart is empty",
                customer_info: {
                    customer_id: customerId,
                    user_id: user.id,
                    username: user.username
                },
                cartItems: [],
                total_items: 0,
                total_amount: 0
            });
        }

        // Calculate total amount
        const totalAmount = cartItems.reduce((sum, item) => sum + parseFloat(item.total_item_price), 0);

        return Promise.resolve({
            status: "success",
            message: "Cart items retrieved successfully",
            customer_info: {
                customer_id: customerId,
                user_id: user.id,
                username: user.username
            },
            cartItems: cartItems,
            total_items: cartItems.length,
            total_amount: totalAmount.toFixed(2)
        });

    } catch (err) {
        console.error("Error during fetching cart items:", err);
        return Promise.reject({
            status: "failed",
            message: err.message,
        });
    }
};

module.exports = {
    getCustomerCartItems
};
