const express = require('express');
const jwtAuth = require('../middleware/jwtAuth');
const validateOrderPermission = require('../middleware/order-validations/validate-order-permission');
const validateCreateOrderData = require('../middleware/order-validations/validate-create-order-data');
const { createOrder } = require('../main/orders/create-order');

const ordersRouter = express.Router();

ordersRouter.post("/",
    jwtAuth,
    validateOrderPermission,
    validateCreateOrderData,
    async (req, res) => {
        const requestData = {
            orderData: req.validatedOrderData,
            user: req.user
        };

        createOrder(requestData)
            .then((data) => {
                return res.status(201).send({
                    status: data.status,
                    message: data.message,
                    order: data.order
                });
            })
            .catch((error) => {
                return res.status(400).send({
                    status: error.status,
                    message: error.message,
                });
            });
    }
);

module.exports = ordersRouter;