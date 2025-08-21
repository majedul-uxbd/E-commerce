const { pool } = require("../../DB/pool");

const deleteCartItemData = async (cartId) => {
    const _query = `DELETE FROM carts WHERE id = ?`;

    try {
        const [result] = await pool.query(_query, [cartId]);
        return result.affectedRows > 0 ? true : false;
    } catch (error) {
        console.log("🚀 ~ deleteCartItemData ~ error:", error);
        return Promise.reject(error);
    }
};

/**
 * @param {*} requestData 
 * @description Deletes a cart item (admin or item owner only)
 * @returns {Promise} Resolves with success message or rejects with error message 
 */
const deleteCartItem = async (requestData) => {
    const { cartId } = requestData;

    try {
        const isDeleted = await deleteCartItemData(cartId);
        if (isDeleted === false) {
            return Promise.reject({
                status: "failed",
                message: "Cart item not found or failed to delete",
            });
        }

        return Promise.resolve({
            status: "success",
            message: "Cart item deleted successfully",
        });

    } catch (err) {
        console.error("Error during cart item deletion:", err);
        return Promise.reject({
            status: "failed",
            message: err.message,
        });
    }
};

module.exports = {
    deleteCartItem
};
