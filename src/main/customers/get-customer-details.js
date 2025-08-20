const { pool } = require("../../DB/pool");

const fetchCustomerById = async (customerId) => {
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
        WHERE
            id = ?
    `;

    try {
        const [rows] = await pool.query(_query, [customerId]);
        return rows.length > 0 ? rows[0] : false;
    } catch (error) {
        return Promise.reject(error);
    }
};

/**
 * @param {*} requestData 
 * @description Gets specific customer details from the database (Admin only)
 * @returns {Promise} Resolves with customer details or rejects with error message 
 */
const getCustomerDetails = async (requestData) => {
    const { customerId } = requestData;

    try {

        // Validate customer ID
        if (!customerId) {
            return Promise.reject({
                status: "failed",
                message: "Customer ID is required",
            });
        } else if (typeof customerId !== 'number') {
            return Promise.reject({
                status: "failed",
                message: "Customer ID must be a number",
            });
        }

        const customer = await fetchCustomerById(customerId);

        if (customer === false) {
            return Promise.reject({
                status: "failed",
                message: "Customer not found",
            });
        }

        return Promise.resolve({
            status: "success",
            message: "Customer details retrieved successfully",
            customer: customer,
        });

    } catch (err) {
        console.error("Error during fetching customer details:", err);
        return Promise.reject({
            status: "failed",
            message: err.message,
        });
    }
};

module.exports = {
    getCustomerDetails
};
