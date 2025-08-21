const { pool } = require("../../DB/pool");

const checkIfCustomerExists = async (customerId) => {
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

const deleteCustomerData = async (customerId) => {
    const _query = `
        DELETE FROM customers 
        WHERE id = ?
    `;

    try {
        const [result] = await pool.query(_query, [customerId]);
        return result.affectedRows > 0 ? true : false;
    } catch (error) {
        console.log("🚀 ~ deleteCustomerData ~ error:", error);
        return Promise.reject(error);
    }
};

/**
 * @param {*} requestData 
 * @description Deletes a customer from the database (Admin only)
 * @returns {Promise} Resolves with success message or rejects with error message 
 */
const deleteCustomer = async (requestData) => {
    const { customerId } = requestData;

    try {

        // Check if customer exists
        const existingCustomer = await checkIfCustomerExists(customerId);
        if (existingCustomer === false) {
            return Promise.reject({
                status: "failed",
                message: "Customer not found",
            });
        }

        const isDeleted = await deleteCustomerData(customerId);

        if (isDeleted === false) {
            return Promise.reject({
                status: "failed",
                message: "Failed to delete customer",
            });
        }

        return Promise.resolve({
            status: "success",
            message: "Customer deleted successfully",
        });

    } catch (err) {
        console.error("Error during customer deletion:", err);
        return Promise.reject({
            status: "failed",
            message: err.message,
        });
    }
};

module.exports = {
    deleteCustomer
};
