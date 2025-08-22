const { pool } = require("../../DB/pool");
const { format } = require("date-fns");

const createOrderData = async (orderData) => {
    const created_at = format(new Date(), "yyyy-MM-dd HH:mm:ss");

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Insert order
        const orderQuery = `
            INSERT INTO orders (customer_id, total_amount, status, created_at)
            VALUES (?, ?, 'pending', ?)
        `;

        const [orderResult] = await connection.query(orderQuery, [
            orderData.customer_id,
            orderData.total_amount,
            created_at
        ]);

        const orderId = orderResult.insertId;

        // Insert order items
        for (const item of orderData.items) {
            const itemQuery = `
                INSERT INTO order_items (order_id, product_id, quantity, unit_price, created_at)
                VALUES (?, ?, ?, ?, ?)
            `;

            await connection.query(itemQuery, [
                orderId,
                item.product_id,
                item.quantity,
                item.unit_price,
                created_at
            ]);

            // Update product stock
            const updateStockQuery = `
                UPDATE products 
                SET stock_quantity = stock_quantity - ?
                WHERE id = ?
            `;

            await connection.query(updateStockQuery, [item.quantity, item.product_id]);
        }

        // Delete cart items after successful order creation
        if (orderData.cartIds.length > 0) {
            const deleteCartQuery = `DELETE FROM carts WHERE id IN (${orderData.cartIds.map(() => '?').join(',')})`;
            await connection.query(deleteCartQuery, orderData.cartIds);
        }

        await connection.commit();
        return orderId;

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * @param {*} requestData 
 * @description Creates a new order from cart items
 * @returns {Promise} Resolves with success message or rejects with error message 
 */
const createOrder = async (requestData) => {
    const { orderData } = requestData;

    try {
        const orderId = await createOrderData(orderData);

        return Promise.resolve({
            status: "success",
            message: "Order created successfully from cart items",
            order: {
                id: orderId,
                customer_id: orderData.customer_id,
                total_amount: orderData.total_amount,
                status: "pending",
                items_count: orderData.items.length,
                cart_items_processed: orderData.cartIds.length
            }
        });

    } catch (err) {
        console.error("Error during order creation:", err);
        return Promise.reject({
            status: "failed",
            message: err.message || "An error occurred while creating the order",
        });
    }
};

module.exports = {
    createOrder
};
