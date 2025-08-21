const { pool } = require("../../DB/pool");

const fetchProductById = async (productId) => {
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

/**
 * @param {*} requestData 
 * @description Gets specific product details from the database (Admin only)
 * @returns {Promise} Resolves with product details or rejects with error message 
 */
const getProductDetails = async (requestData) => {
    const { productId, user } = requestData;

    try {

        // Validate product ID
        if (!productId) {
            return Promise.reject({
                status: "failed",
                message: "Product ID is required",
            });
        }

        const product = await fetchProductById(productId);

        if (product === false) {
            return Promise.reject({
                status: "failed",
                message: "Product not found",
            });
        }

        return Promise.resolve({
            status: "success",
            message: "Product details retrieved successfully",
            product: product,
        });

    } catch (err) {
        console.error("Error during fetching product details:", err);
        return Promise.reject({
            status: "failed",
            message: err.message,
        });
    }
};

module.exports = {
    getProductDetails
};
