const express = require('express');
const jwtAuth = require('../middleware/jwtAuth');
const { addCartItem } = require('../main/carts/add-cart');
const validateCartPermission = require('../middleware/cart-validations/validate-cart-permission');
const { getCustomerCartItems } = require('../main/carts/get-customer-carts');
const { deleteCartItem } = require('../main/carts/delete-cart');
const validateCartOwnership = require('../middleware/cart-validations/validate-cart-ownership');
const validateCartId = require('../middleware/cart-validations/validate-cart-id');
const validateProductId = require('../middleware/cart-validations/validate-product-id');
const validateQuantity = require('../middleware/cart-validations/validate-quantity');


const cartRouter = express.Router();

//Tested
cartRouter.post("/", jwtAuth, validateProductId, validateQuantity, validateCartPermission, async (req, res) => {
    const requestData = {
        cartData: req.body,
        user: req.user
    };

    addCartItem(requestData)
        .then((data) => {
            return res.status(200).send({
                status: data.status,
                message: data.message,
            });
        })
        .catch((error) => {
            return res.status(400).send({
                status: error.status,
                message: error.message,
            });
        });
});


cartRouter.post("/getCustomerId", jwtAuth, validateCartPermission, async (req, res) => {
    const requestData = {
        customerId: req.body.customer_id,
        user: req.user
    };

    getCustomerCartItems(requestData)
        .then((data) => {
            return res.status(200).send({
                status: data.status,
                message: data.message,
                customer_info: data.customer_info,
                cartItems: data.cartItems,
                summary: {
                    total_items: data.total_items,
                    total_amount: data.total_amount
                }
            });
        })
        .catch((error) => {
            return res.status(400).send({
                status: error.status,
                message: error.message,
            });
        });
});


cartRouter.post("/delete-cart", jwtAuth, validateCartId, validateCartOwnership, async (req, res) => {
    const requestData = {
        cartId: req.body.cartId,
        user: req.user
    };

    deleteCartItem(requestData)
        .then((data) => {
            return res.status(200).send({
                status: data.status,
                message: data.message,
            });
        })
        .catch((error) => {
            return res.status(400).send({
                status: error.status,
                message: error.message,
            });
        });
});


module.exports = cartRouter;