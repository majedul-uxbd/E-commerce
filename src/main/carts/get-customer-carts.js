const { pool } = require("../../DB/pool");

const fetchCustomerCartItems = async (customerId) => {
    const _query = `
        SELECT 
            c.id,
            c.customer_id,
            c.product_id,
            c.quantity,
            c.created_at,
            c.updated_at,
            p.name as product_name,
            p.description as product_description,
            p.price as product_price,
            p.stock_quantity as available_stock
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
                cartItems: [],
            });
        }

        return Promise.resolve({
            status: "success",
            message: "Cart items retrieved successfully",
            cartItems: cartItems,
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
