const { pool } = require("../../DB/pool");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const checkIfUserExists = async (username) => {
    const _query = `
    SELECT
        id, username, email, password, role, created_at
    FROM
        users
    WHERE
        username = ? OR email = ?
    `;
    try {
        const [rows] = await pool.query(_query, [username, username]);
        return rows.length > 0 ? rows[0] : false;
    } catch (error) {
        return error;
    }
};

const verifyPassword = async (plainPassword, hashedPassword) => {
    try {
        const isValid = await bcrypt.compare(plainPassword, hashedPassword);
        return isValid;
    } catch (error) {
        return false;
    }
};

const generateJWTToken = (userData) => {
    try {
        const tokenPayload = {
            id: userData.id,
            username: userData.username,
            role: userData.role
        };

        // Add customer_id to token payload if available
        if (userData.customer_id) {
            tokenPayload.customer_id = userData.customer_id;
        }

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        return token;
    } catch (error) {
        console.error("Error generating JWT token:", error);
        return false;
    }
};

const loginUser = async (loginData) => {
    const { username, password } = loginData;

    try {
        const user = await checkIfUserExists(username);

        if (user === false) {
            return Promise.reject({
                status: "failed",
                message: "User not found",
            });
        }

        const isPasswordValid = await verifyPassword(password, user.password);

        if (!isPasswordValid) {
            return Promise.reject({
                status: "failed",
                message: "Invalid password",
            });
        }

        // Get customer_id if user is a customer - inline approach
        let customer_id = null;
        if (user.role === 'customer') {
            try {
                const customerQuery = `SELECT id FROM customers WHERE user_id = ?`;
                const [customerRows] = await pool.query(customerQuery, [user.id]);

                if (customerRows.length > 0) {
                    customer_id = customerRows[0].id;
                } else {
                    console.warn(`Customer record not found for user_id: ${user.id}`);
                    return Promise.reject({
                        status: "failed",
                        message: "Customer profile not found. Please contact support.",
                    });
                }
            } catch (dbError) {
                console.error("Database error while fetching customer_id:", dbError);
                return Promise.reject({
                    status: "failed",
                    message: "Database error during login",
                });
            }
        }

        const token = generateJWTToken({
            ...user,
            customer_id: customer_id
        });

        if (!token) {
            return Promise.reject({
                status: "failed",
                message: "Failed to generate token",
            });
        }

        // Prepare response user object
        const responseUser = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        };

        // Add customer_id to response if available
        if (customer_id) {
            responseUser.customer_id = customer_id;
        }

        return Promise.resolve({
            status: "success",
            message: "Login successful",
            token: token,
            user: responseUser
        });

    } catch (err) {
        console.error("Error during login:", err);
        return Promise.reject({
            status: "failed",
            message: err.message || "An error occurred during login",
        });
    }
};

module.exports = { loginUser };
