const { pool } = require("../../DB/pool");

const checkIfUserIsAdmin = (user) => {
    return user && user.role === 'admin';
};

const fetchAllCustomers = async () => {
    const _query = `
        SELECT
            id,
            name,
            email,
            role,
            address,
            phone,
            created_at
        FROM
            customers
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
 * @description Gets all customers from the database (Admin only)
 * @returns {Promise} Resolves with customers list or rejects with error message 
 */
const getAllCustomers = async (requestData) => {
    const { user } = requestData;

    try {
        // Check if user is admin
        if (!checkIfUserIsAdmin(user)) {
            return Promise.reject({
                status: "failed",
                message: "Access denied. Admin role required.",
            });
        }

        const customers = await fetchAllCustomers();

        if (customers.length === 0) {
            return Promise.resolve({
                status: "success",
                message: "No customers found",
                customers: [],
            });
        }

        return Promise.resolve({
            status: "success",
            message: "Customers retrieved successfully",
            customers: customers,
        });

    } catch (err) {
        console.error("Error during fetching customers:", err);
        return Promise.reject({
            status: "failed",
            message: err.message,
        });
    }
};

module.exports = {
    getAllCustomers
};
