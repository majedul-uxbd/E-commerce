const { pool } = require("../../DB/pool");
const { format } = require("date-fns");
const bcrypt = require("bcryptjs");

const checkIfEmailExists = async (email) => {
    // Check both users and customers tables
    const userQuery = `SELECT email FROM users WHERE email = ?`;
    const customerQuery = `SELECT email FROM customers WHERE email = ?`;

    try {
        const [userRows] = await pool.query(userQuery, [email]);
        const [customerRows] = await pool.query(customerQuery, [email]);

        return userRows.length > 0 || customerRows.length > 0;
    } catch (error) {
        return Promise.reject(error);
    }
};

const insertUserData = async (userData) => {
    const _query = `
        INSERT INTO users (username, email, password, role, created_at) 
        VALUES (?, ?, ?, ?, NOW())
    `;

    try {
        const [result] = await pool.query(_query, [
            userData.username,
            userData.email,
            userData.password,
            userData.role
        ]);
        return {
            success: result.affectedRows > 0,
            userId: result.insertId
        };
    } catch (error) {
        return Promise.reject(error);
    }
};

const insertCustomerData = async (userData, userId) => {
    const _query = `
        INSERT INTO customers (user_id, name, email, password, role, address, phone, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    try {
        const [result] = await pool.query(_query, [
            userId, // Link to users table
            userData.username, // Using username as name for customers
            userData.email,
            userData.password,
            userData.role,
            userData.address,
            userData.phone
        ]);
        return result.affectedRows > 0;
    } catch (error) {
        return Promise.reject(error);
    }
};

const registerUser = async (userData) => {
    const { username, email, password, role, address, phone } = userData;

    try {
        // Check if email already exists in either table
        const emailExists = await checkIfEmailExists(email);
        if (emailExists === true) {
            return Promise.reject({
                status: "failed",
                message: "Email already exists",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const userDataWithHashedPassword = {
            ...userData,
            password: hashedPassword
        };

        // STEP 1: Always insert into users table first
        const userInsertResult = await insertUserData(userDataWithHashedPassword);

        if (!userInsertResult.success) {
            return Promise.reject({
                status: "failed",
                message: "Failed to register user",
            });
        }

        let successMessage;

        // STEP 2: If customer, also insert into customers table
        if (role === 'customer') {
            const customerInserted = await insertCustomerData(userDataWithHashedPassword, userInsertResult.userId);

            if (!customerInserted) {
                return Promise.reject({
                    status: "failed",
                    message: "Failed to register customer details",
                });
            }

            successMessage = "Customer registered successfully";
        } else {
            // Admin or Developer
            successMessage = "Admin/Developer registered successfully";
        }

        return Promise.resolve({
            status: "success",
            message: successMessage,
        });

    } catch (err) {
        console.error("Error during registration:", err);
        return Promise.reject({
            status: "failed",
            message: err.message,
        });
    }
};

module.exports = { registerUser };
