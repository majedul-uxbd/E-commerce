const { pool } = require("../../DB/pool");

const checkIfUserExists = async (userId) => {
    const _query = `
        SELECT 
            id, username, email, role, created_at, updated_at
        FROM 
            users
        WHERE 
            id = ?
    `;

    try {
        const [rows] = await pool.query(_query, [userId]);
        return rows.length > 0 ? rows[0] : false;
    } catch (error) {
        return error;
    }
};

const checkUserPermission = (userId, requestingUser) => {
    // Users can only access their own details unless they are admin
    if (parseInt(userId) === requestingUser.id || requestingUser.role === "admin") {
        return true;
    }
    return false;
};

const getUserDetails = async (requestData) => {
    const { userId, requestingUser } = requestData;

    try {

        // Add safety check
        if (!requestingUser) {
            return Promise.reject({
                status: "failed",
                message: "Authentication required",
            });
        }

        // Check permission
        const hasPermission = checkUserPermission(userId, requestingUser);

        if (!hasPermission) {
            return Promise.reject({
                status: "failed",
                message: "Access denied",
            });
        }

        const user = await checkIfUserExists(userId);

        if (user === false) {
            return Promise.reject({
                status: "failed",
                message: "User not found",
            });
        }

        return Promise.resolve({
            status: "success",
            message: "User details retrieved successfully",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                created_at: user.created_at,
                updated_at: user.updated_at,
            },
        });

    } catch (err) {
        console.error("Error getting user details:", err);
        return Promise.reject({
            status: "failed",
            message: err.message,
        });
    }
};

module.exports = { getUserDetails };