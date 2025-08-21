const express = require('express');
const jwtAuth = require('../middleware/jwtAuth');
const { addCartItem } = require('../main/carts/add-cart');
const validateCartData = require('../middleware/cart-validations/validate-cart-data');
const validateCartPermission = require('../middleware/cart-validations/validate-cart-permission');
const validateCustomerId = require('../middleware/customer-validation/validateCustomerId');
const { getCustomerCartItems } = require('../main/carts/get-customer-carts');
const validateCartId = require('../middleware/cart-validations/validate-cart-id');
const { deleteCartItem } = require('../main/carts/delete-cart');
const validateCartOwnership = require('../middleware/cart-validations/validate-cart-ownership');

const cartRouter = express.Router();

//Tested
cartRouter.post("/", jwtAuth, validateCartPermission, validateCartData, async (req, res) => {
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

// For getting customer cart items - auto-assign customer_id
cartRouter.post("/getCustomerId", jwtAuth, validateCartPermission, async (req, res) => {
    const requestData = {
        customerId: req.body.customer_id, // This will be auto-assigned by middleware
        user: req.user
    };

    getCustomerCartItems(requestData)
        .then((data) => {
            return res.status(200).send({
                status: data.status,
                message: data.message,
                cartItems: data.cartItems,
            });
        })
        .catch((error) => {
            return res.status(400).send({
                status: error.status,
                message: error.message,
            });
        });
});


cartRouter.delete("/delete-cart", jwtAuth, validateCartOwnership, async (req, res) => {
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