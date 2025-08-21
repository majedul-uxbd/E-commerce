const { pool } = require("../../DB/pool");
const { format } = require("date-fns");
const bcrypt = require("bcryptjs");

const checkIfEmailExists = async (email) => {
    const _query = `
    SELECT
      	email
    FROM
      	customers
    WHERE
      	email = ?
  `;

    try {
        const [row] = await pool.query(_query, [email]);
        return row.length > 0 ? true : false;
    } catch (error) {
        return Promise.reject(error);
    }
};

const insertCustomerData = async (values) => {
    const _query = `
	INSERT INTO customers (name, email, password, role, address, phone, created_at)	
	VALUES (?, ?, ?, ?, ?, ?, ?);
	`;
    const _values = [
        values.name,
        values.email,
        values.password,
        values.role,
        values.address,
        values.phone,
        values.created_at
    ];
    try {
        const [result] = await pool.query(_query, _values);
        return result.affectedRows > 0 ? true : false;
    } catch (error) {
        console.log("🚀 ~ insertCustomerData ~ error:", error)
        return Promise.reject(error);
    }
};

/**
 * 
 * @param {*} customerData 
 * @description Registers a new customer
 * @returns {Promise} Resolves with success message or rejects with error message 
 */
const registerCustomer = async (customerData) => {
    const role = 'customer';
    // const { name, email, address, phone, password, role } = customerData;
    customerData = { ...customerData, role };
    const created_at = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    try {
        const isExist = await checkIfEmailExists(customerData.email);
        if (isExist === true) {
            return Promise.reject({
                status: "failed",
                message: "Email already exists",
            });
        }
        const hashedPassword = await bcrypt.hash(customerData.password, 10);
        customerData = { ...customerData, password: hashedPassword, created_at: created_at };
        const isInserted = await insertCustomerData(customerData);
        if (isInserted === false) {
            return Promise.reject({
                status: "failed",
                message: "Failed to register customer",
            });
        }
        return Promise.resolve({
            status: "success",
            message: "Customer registered successfully",
        });
    } catch (err) {
        console.error("Error during registration:", err);
        return Promise.reject({
            status: "failed",
            message: err.message,
        });
    }
};

module.exports = {
    registerCustomer
};