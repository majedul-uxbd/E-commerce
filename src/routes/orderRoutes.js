const express = require('express');
const jwtAuth = require('../middleware/jwtAuth');
const validateOrderPermission = require('../middleware/order-validations/validate-order-permission');
const validateCreateOrderData = require('../middleware/order-validations/validate-create-order-data');
const { createOrder } = require('../main/orders/create-order');
const validateOrderOwnership = require('../middleware/order-validations/validate-order-ownership');
const { getCustomerOrders } = require('../main/orders/get-customer-orders');
const { updateOrderStatus } = require('../main/orders/update-order-status');
const validateGetOrdersData = require('../middleware/order-validations/validate-get-orders-data');
const validateUpdateStatusData = require('../middleware/order-validations/validate-update-status-data');

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


ordersRouter.get("/customer-orders",
    jwtAuth,
    validateOrderPermission,
    validateGetOrdersData,
    async (req, res) => {
        const requestData = {
            customerId: req.validatedCustomerId,
            user: req.user
        };

        getCustomerOrders(requestData)
            .then((data) => {
                return res.status(200).send({
                    status: data.status,
                    message: data.message,
                    orders: data.orders,
                    summary: data.summary
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


ordersRouter.patch("/update-order-status",
    jwtAuth,
    validateOrderPermission,
    validateUpdateStatusData,
    validateOrderOwnership,
    async (req, res) => {
        const requestData = {
            orderId: req.validatedOrderId,
            status: req.validatedStatus,
            user: req.user
        };

        updateOrderStatus(requestData)
            .then((data) => {
                return res.status(200).send({
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