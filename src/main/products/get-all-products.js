const { pool } = require("../../DB/pool");

const checkIfUserIsAdmin = (user) => {
    return user && user.role === 'admin';
};

const fetchAllProducts = async () => {
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
        ORDER BY created_at DESC
    `;

    try {
        const [rows] = await pool.query(_query);
        return rows.length > 0 ? rows : [];
    } catch (error) {
        return Promise.reject(error);
    }
};

/**
 * @param {*} requestData 
 * @description Gets all products from the database (Admin only)
 * @returns {Promise} Resolves with products list or rejects with error message 
 */
const getAllProducts = async (requestData) => {
    const { user } = requestData;

    try {
        // Check if user is admin
        if (!checkIfUserIsAdmin(user)) {
            return Promise.reject({
                status: "failed",
                message: "Access denied. Admin role required.",
            });
        }

        const products = await fetchAllProducts();

        if (products.length === 0) {
            return Promise.resolve({
                status: "success",
                message: "No products found",
                products: [],
            });
        }

        return Promise.resolve({
            status: "success",
            message: "Products retrieved successfully",
            products: products,
        });

    } catch (err) {
        console.error("Error during fetching products:", err);
        return Promise.reject({
            status: "failed",
            message: err.message,
        });
    }
};

module.exports = {
    getAllProducts
};
