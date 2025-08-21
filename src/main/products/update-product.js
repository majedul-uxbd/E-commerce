const { pool } = require("../../DB/pool");
const { format } = require("date-fns");

const checkIfProductExists = async (productId) => {
    const _query = `
        SELECT
            id,
            name,
            description,
            price,
            stock_quantity,
            created_at,
            updated_at
        FROM
            products
        WHERE
            id = ?
    `;

    try {
        const [rows] = await pool.query(_query, [productId]);
        return rows.length > 0 ? rows[0] : false;
    } catch (error) {
        return Promise.reject(error);
    }
};


const updateProductData = async (productId, updateFields) => {
    const updated_at = format(new Date(), "yyyy-MM-dd HH:mm:ss");

    // dynamic query
    const fields = [];
    const values = [];

    if (updateFields.name) {
        fields.push("name = ?");
        values.push(updateFields.name);
    }

    if (updateFields.description) {
        fields.push("description = ?");
        values.push(updateFields.description);
    }

    if (updateFields.price) {
        fields.push("price = ?");
        values.push(updateFields.price);
    }

    if (updateFields.stock_quantity !== undefined) {
        fields.push("stock_quantity = ?");
        values.push(updateFields.stock_quantity);
    }

    // Always update updated_at
    fields.push("updated_at = ?");
    values.push(updated_at);

    // Add product ID for WHERE clause
    values.push(productId);

    const _query = `
        UPDATE products 
        SET ${fields.join(", ")}
        WHERE id = ?
    `;

    try {
        const [result] = await pool.query(_query, values);
        return result.affectedRows > 0 ? true : false;
    } catch (error) {
        console.log("🚀 ~ updateProductData ~ error:", error);
        return Promise.reject(error);
    }
};

/**
 * @param {*} requestData 
 * @description Updates product information (Admin only)
 * @returns {Promise} Resolves with success message or rejects with error message 
 */
const updateProduct = async (requestData) => {
    const { productId, updateData } = requestData;

    try {
        // Check if product exists
        const existingProduct = await checkIfProductExists(productId);
        if (existingProduct === false) {
            return Promise.reject({
                status: "failed",
                message: "Product not found",
            });
        }

        const isUpdated = await updateProductData(productId, updateData);

        if (isUpdated === false) {
            return Promise.reject({
                status: "failed",
                message: "Failed to update product",
            });
        }

        // Get updated product data
        const updatedProduct = await checkIfProductExists(productId);

        return Promise.resolve({
            status: "success",
            message: "Product updated successfully",
            product: updatedProduct,
        });

    } catch (err) {
        console.error("Error during product update:", err);
        return Promise.reject({
            status: "failed",
            message: err.message,
        });
    }
};

module.exports = {
    updateProduct
};
