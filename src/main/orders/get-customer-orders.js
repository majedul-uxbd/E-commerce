const { pool } = require("../../DB/pool");

const fetchCustomerOrders = async (customerId) => {
    const _query = `
        SELECT 
            o.id,
            o.customer_id,
            o.total_amount,
            o.status,
            o.created_at,
            o.updated_at,
            COUNT(oi.id) as items_count
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.customer_id = ?
        GROUP BY o.id
        ORDER BY o.created_at DESC
    `;

    try {
        const [rows] = await pool.query(_query, [customerId]);
        return rows || [];
    } catch (error) {
        return Promise.reject(error);
    }
};

const fetchOrderDetails = async (orderId) => {
    const _query = `
        SELECT 
            oi.id,
            oi.product_id,
            oi.quantity,
            oi.unit_price,
            (oi.quantity * oi.unit_price) as total_price,
            p.name as product_name,
            p.description as product_description
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
        ORDER BY oi.id
    `;

    try {
        const [rows] = await pool.query(_query, [orderId]);
        return rows || [];
    } catch (error) {
        return Promise.reject(error);
    }
};

/**
 * @param {*} requestData 
 * @description Gets all orders for a customer with order details
 * @returns {Promise} Resolves with orders or rejects with error message 
 */
const getCustomerOrders = async (requestData) => {
    const { customerId } = requestData;

    try {
        const orders = await fetchCustomerOrders(customerId);

        if (orders.length === 0) {
            return Promise.resolve({
                status: "success",
                message: "No orders found",
                orders: [],
                summary: {
                    total_orders: 0,
                    total_spent: 0
                }
            });
        }

        // Get order details for each order
        const ordersWithDetails = await Promise.all(
            orders.map(async (order) => {
                const orderDetails = await fetchOrderDetails(order.id);
                return {
                    ...order,
                    items: orderDetails
                };
            })
        );

        const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

        return Promise.resolve({
            status: "success",
            message: "Orders retrieved successfully",
            orders: ordersWithDetails,
            summary: {
                total_orders: orders.length,
                total_spent: totalSpent.toFixed(2)
            }
        });

    } catch (err) {
        console.error("Error during fetching orders:", err);
        return Promise.reject({
            status: "failed",
            message: err.message,
        });
    }
};

module.exports = {
    getCustomerOrders
};
