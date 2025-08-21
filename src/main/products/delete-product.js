const { pool } = require("../../DB/pool");

const checkIfProductExists = async (productId) => {
    const _query = `
        SELECT
            id,
            name,
            description,
            price,
            stock_quantity,
            created_at,
            updated_at
        FROM
            products
        WHERE
            id = ?
    `;

    try {
        const [rows] = await pool.query(_query, [productId]);
        return rows.length > 0 ? rows[0] : false;
    } catch (error) {
        return Promise.reject(error);
    }
};

const deleteProductData = async (productId) => {
    const _query = `
        DELETE FROM products 
        WHERE id = ?
    `;

    try {
        const [result] = await pool.query(_query, [productId]);
        return result.affectedRows > 0 ? true : false;
    } catch (error) {
        console.log("🚀 ~ deleteProductData ~ error:", error);
        return Promise.reject(error);
    }
};

/**
 * @param {*} requestData 
 * @description Deletes a product from the database (Admin only)
 * @returns {Promise} Resolves with success message or rejects with error message 
 */
const deleteProduct = async (requestData) => {
    const { productId } = requestData;

    try {
        // Check if product exists
        const existingProduct = await checkIfProductExists(productId);
        if (existingProduct === false) {
            return Promise.reject({
                status: "failed",
                message: "Product not found",
            });
        }

        const isDeleted = await deleteProductData(productId);

        if (isDeleted === false) {
            return Promise.reject({
                status: "failed",
                message: "Failed to delete product",
            });
        }

        return Promise.resolve({
            status: "success",
            message: "Product deleted successfully",
        });

    } catch (err) {
        console.error("Error during product deletion:", err);
        return Promise.reject({
            status: "failed",
            message: err.message,
        });
    }
};

module.exports = {
    deleteProduct
};
