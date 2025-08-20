const { pool } = require("../../DB/pool");
const { format } = require("date-fns");
const bcrypt = require("bcryptjs");


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

const checkIfEmailExistsForOtherCustomer = async (email, customerId) => {
    const _query = `
        SELECT
            id
        FROM
            customers
        WHERE
            email = ? AND id != ?
    `;

    try {
        const [rows] = await pool.query(_query, [email, customerId]);
        return rows.length > 0 ? true : false;
    } catch (error) {
        return Promise.reject(error);
    }
};

const updateCustomerData = async (customerId, updateFields) => {
    const updated_at = format(new Date(), "yyyy-MM-dd HH:mm:ss");

    // dynamic query
    const fields = [];
    const values = [];

    if (updateFields.name) {
        fields.push("name = ?");
        values.push(updateFields.name);
    }

    if (updateFields.email) {
        fields.push("email = ?");
        values.push(updateFields.email);
    }

    if (updateFields.address) {
        fields.push("address = ?");
        values.push(updateFields.address);
    }

    if (updateFields.phone) {
        fields.push("phone = ?");
        values.push(updateFields.phone);
    }

    if (updateFields.password) {
        fields.push("password = ?");
        values.push(updateFields.password);
    }

    // Always update updated_at
    fields.push("updated_at = ?");
    values.push(updated_at);

    // Add customer ID for WHERE clause
    values.push(customerId);

    const _query = `
        UPDATE customers 
        SET ${fields.join(", ")}
        WHERE id = ?
    `;

    try {
        const [result] = await pool.query(_query, values);
        return result.affectedRows > 0 ? true : false;
    } catch (error) {
        console.log("🚀 ~ updateCustomerData ~ error:", error);
        return Promise.reject(error);
    }
};

/**
 * @param {*} requestData 
 * @description Updates customer information (Admin only)
 * @returns {Promise} Resolves with success message or rejects with error message 
 */
const updateCustomer = async (requestData) => {
    const { customerId, updateData, user } = requestData;

    try {

        // Validate customer ID
        if (!customerId) {
            return Promise.reject({
                status: "failed",
                message: "Customer ID is required",
            });
        }

        // Check if customer exists
        const existingCustomer = await checkIfCustomerExists(customerId);
        if (existingCustomer === false) {
            return Promise.reject({
                status: "failed",
                message: "Customer not found",
            });
        }

        // Check if at least one field is provided for update
        if (!updateData.name || !updateData.email && !updateData.address && !updateData.phone && !updateData.password) {
            return Promise.reject({
                status: "failed",
                message: "At least one field is required to update",
            });
        }

        // If email is being updated, check if it already exists for another customer
        if (updateData.email) {
            const emailExists = await checkIfEmailExistsForOtherCustomer(updateData.email, customerId);
            if (emailExists === true) {
                return Promise.reject({
                    status: "failed",
                    message: "Email already exists for another customer",
                });
            }
        }

        // Hash password if provided
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        const isUpdated = await updateCustomerData(customerId, updateData);

        if (isUpdated === false) {
            return Promise.reject({
                status: "failed",
                message: "Failed to update customer",
            });
        }

        // Get updated customer data
        const updatedCustomer = await checkIfCustomerExists(customerId);

        return Promise.resolve({
            status: "success",
            message: "Customer updated successfully",
            customer: updatedCustomer,
        });

    } catch (err) {
        console.error("Error during customer update:", err);
        return Promise.reject({
            status: "failed",
            message: err.message,
        });
    }
};

module.exports = {
    updateCustomer
};
