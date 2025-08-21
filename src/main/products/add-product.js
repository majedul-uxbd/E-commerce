const { pool } = require("../../DB/pool");
const { format } = require("date-fns");


const validateProductData = (productData) => {
    const { name, description, price, stock_quantity } = productData;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
        return "Product name is required";
    }

    if (!description || typeof description !== "string" || description.trim().length === 0) {
        return "Product description is required";
    }

    if (!price || typeof price !== "number" || price <= 0) {
        return "Valid price is required (must be greater than 0)";
    }

    if (!stock_quantity || typeof stock_quantity !== "number" || stock_quantity < 0) {
        return "Valid stock quantity is required (must be 0 or greater)";
    }

    return null;
};

const checkIfProductNameExists = async (name) => {
    const _query = `
        SELECT
            name
        FROM
            products
        WHERE
            name = ?
    `;

    try {
        const [row] = await pool.query(_query, [name]);
        return row.length > 0 ? true : false;
    } catch (error) {
        return Promise.reject(error);
    }
};

const insertProductData = async (values) => {
    const _query = `
        INSERT INTO products (name, description, price, stock_quantity, created_at) 
        VALUES (?, ?, ?, ?, ?);
    `;
    const _values = [
        values.name,
        values.description,
        values.price,
        values.stock_quantity,
        values.created_at
    ];

    try {
        const [result] = await pool.query(_query, _values);
        return result.affectedRows > 0 ? true : false;
    } catch (error) {
        console.log("🚀 ~ insertProductData ~ error:", error);
        return Promise.reject(error);
    }
};

/**
 * @param {*} requestData 
 * @description Adds a new product (Admin only) - All fields required
 * @returns {Promise} Resolves with success message or rejects with error message 
 */
const addProduct = async (requestData) => {
    const { productData, user } = requestData;
    const created_at = format(new Date(), "yyyy-MM-dd HH:mm:ss");

    try {

        // Validate all required fields
        const validationError = validateProductData(productData);
        if (validationError) {
            return Promise.reject({
                status: "failed",
                message: validationError,
            });
        }

        const isExist = await checkIfProductNameExists(productData.name);
        if (isExist === true) {
            return Promise.reject({
                status: "failed",
                message: "Product name already exists",
            });
        }

        const productWithTimestamp = { ...productData, created_at: created_at };
        const isInserted = await insertProductData(productWithTimestamp);

        if (isInserted === false) {
            return Promise.reject({
                status: "failed",
                message: "Failed to add product",
            });
        }

        return Promise.resolve({
            status: "success",
            message: "Product added successfully",
        });

    } catch (err) {
        console.error("Error during product creation:", err);
        return Promise.reject({
            status: "failed",
            message: err.message,
        });
    }
};

module.exports = {
    addProduct
};
