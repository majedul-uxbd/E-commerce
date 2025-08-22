const { pool } = require("../../DB/pool");
const { format } = require("date-fns");

const updateOrderStatusData = async (orderId, status) => {
    const updated_at = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    const _query = `
        UPDATE orders 
        SET status = ?, updated_at = ?
        WHERE id = ?
    `;

    try {
        const [result] = await pool.query(_query, [status, updated_at, orderId]);
        return result.affectedRows > 0 ? true : false;
    } catch (error) {
        console.log("🚀 ~ updateOrderStatusData ~ error:", error);
        return Promise.reject(error);
    }
};

/**
 * @param {*} requestData 
 * @description Updates order status
 * @returns {Promise} Resolves with success message or rejects with error message 
 */
const updateOrderStatus = async (requestData) => {
    const { orderId, status } = requestData;

    try {
        const isUpdated = await updateOrderStatusData(orderId, status);

        if (!isUpdated) {
            return Promise.reject({
                status: "failed",
                message: "Failed to update order status",
            });
        }

        return Promise.resolve({
            status: "success",
            message: "Order status updated successfully",
            order: {
                id: orderId,
                status: status
            }
        });

    } catch (err) {
        console.error("Error during order status update:", err);
        return Promise.reject({
            status: "failed",
            message: err.message || "An error occurred while updating order status",
        });
    }
};

module.exports = {
    updateOrderStatus
};
