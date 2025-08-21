const { pool } = require("../../DB/pool");
const { format } = require("date-fns");

const checkIfProductExists = async (productId) => {
    const _query = `
        SELECT id, stock_quantity 
        FROM products 
        WHERE id = ?
    `;

    try {
        const [rows] = await pool.query(_query, [productId]);
        return rows.length > 0 ? rows[0] : false;
    } catch (error) {
        return Promise.reject(error);
    }
};

const checkIfCartItemExists = async (customerId, productId) => {
    const _query = `
        SELECT id, quantity 
        FROM carts 
        WHERE customer_id = ? AND product_id = ?
    `;

    try {
        const [rows] = await pool.query(_query, [customerId, productId]);
        return rows.length > 0 ? rows[0] : false;
    } catch (error) {
        return Promise.reject(error);
    }
};

const insertCartData = async (cartData) => {
    const created_at = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    const _query = `
        INSERT INTO carts (customer_id, product_id, quantity, created_at)
        VALUES (?, ?, ?, ?)
    `;
    const _values = [
        cartData.customer_id,
        cartData.product_id,
        cartData.quantity,
        created_at
    ];

    try {
        const [result] = await pool.query(_query, _values);
        return result.affectedRows > 0 ? true : false;
    } catch (error) {
        console.log("🚀 ~ insertCartData ~ error:", error);
        return Promise.reject(error);
    }
};

const updateCartQuantity = async (cartId, newQuantity) => {
    const updated_at = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    const _query = `
        UPDATE carts 
        SET quantity = ?, updated_at = ?
        WHERE id = ?
    `;

    try {
        const [result] = await pool.query(_query, [newQuantity, updated_at, cartId]);
        return result.affectedRows > 0 ? true : false;
    } catch (error) {
        console.log("🚀 ~ updateCartQuantity ~ error:", error);
        return Promise.reject(error);
    }
};

/**
 * @param {*} requestData 
 * @description Adds a product to customer's cart
 * @returns {Promise} Resolves with success message or rejects with error message 
 */
const addCartItem = async (requestData) => {
    const { cartData } = requestData;

    try {
        // Check if product exists and has stock
        const product = await checkIfProductExists(cartData.product_id);
        if (product === false) {
            return Promise.reject({
                status: "failed",
                message: "Product not found",
            });
        }

        if (product.stock_quantity < cartData.quantity) {
            return Promise.reject({
                status: "failed",
                message: "Insufficient stock available",
            });
        }

        // Check if item already exists in cart
        const existingCartItem = await checkIfCartItemExists(cartData.customer_id, cartData.product_id);

        if (existingCartItem) {
            // Update existing cart item quantity
            const newQuantity = existingCartItem.quantity + cartData.quantity;

            if (newQuantity > product.stock_quantity) {
                return Promise.reject({
                    status: "failed",
                    message: "Total quantity exceeds available stock",
                });
            }

            const isUpdated = await updateCartQuantity(existingCartItem.id, newQuantity);
            if (isUpdated === false) {
                return Promise.reject({
                    status: "failed",
                    message: "Failed to update cart item",
                });
            }

            return Promise.resolve({
                status: "success",
                message: "Cart item quantity updated successfully",
            });
        } else {
            // Insert new cart item
            const isInserted = await insertCartData(cartData);
            if (isInserted === false) {
                return Promise.reject({
                    status: "failed",
                    message: "Failed to add item to cart",
                });
            }

            return Promise.resolve({
                status: "success",
                message: "Item added to cart successfully",
            });
        }

    } catch (err) {
        console.error("Error during adding to cart:", err);
        return Promise.reject({
            status: "failed",
            message: err.message,
        });
    }
};

module.exports = {
    addCartItem
};
