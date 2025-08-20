const { pool } = require("../../DB/pool");
const { format } = require("date-fns");
const bcrypt = require("bcryptjs");

const checkIfEmailExists = async (email) => {
    const _query = `
    SELECT
      	email
    FROM
      	users
    WHERE
      	email = ?
  `;

    try {
        const [row] = await pool.query(_query, [email]);
        return row.length > 0 ? true : false;
    } catch (error) {
        return error;
    }
};

const insertRegisterData = async (values) => {
    const _query = `
	INSERT INTO users (username, email, password, role, created_at)	
	VALUES (?, ?, ?, ?, NOW())
	`;
    try {
        const [result] = await pool.query(_query, values);
        return result.affectedRows > 0 ? true : false;
    } catch (error) {
        return error;
    }
};

const registerUser = async (userData) => {
    const { username, email, password, role } = userData;
    const created_at = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    try {
        const isExist = await checkIfEmailExists(email);
        if (isExist === true) {
            return Promise.reject({
                status: "failed",
                message: "Email already exists",
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const values = [username, email, hashedPassword, role, created_at];
        const isInserted = await insertRegisterData(values);
        if (isInserted === false) {
            return Promise.reject({
                status: "failed",
                message: "Failed to register user",
            });
        }
        return Promise.resolve({
            status: "success",
            message: "User registered successfully",
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