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
}


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
        const token = jwt.sign(
            {
                id: userData.id,
                username: userData.username,
                role: userData.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        return token;
    } catch (error) {
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

        const token = generateJWTToken(user);

        if (!token) {
            return Promise.reject({
                status: "failed",
                message: "Failed to generate token",
            });
        }

        return Promise.resolve({
            status: "success",
            message: "Login successful",
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            }
        });

    } catch (err) {
        console.error("Error during login:", err);
        return Promise.reject({
            status: "failed",
            message: err.message,
        });
    }
}

module.exports = { loginUser };