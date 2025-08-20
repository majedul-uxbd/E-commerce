const express = require("express");
const jwtAuth = require("../middleware/jwtAuth");
const { registerCustomer } = require("../main/customers/add-customer");
const { getAllCustomers } = require("../main/customers/get-all-customers");
const { getCustomerDetails } = require("../main/customers/get-customer-details");

const customerRouter = express.Router();

customerRouter.post("/create", async (req, res) => {
    registerCustomer(req.body)
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


customerRouter.get("/", jwtAuth, async (req, res) => {
    const requestData = {
        user: req.user
    };

    getAllCustomers(requestData)
        .then((data) => {
            return res.status(200).send({
                status: data.status,
                message: data.message,
                customers: data.customers,
            });
        })
        .catch((error) => {
            return res.status(400).send({
                status: error.status,
                message: error.message,
            });
        });
});


customerRouter.post("/get-customer-details", jwtAuth, async (req, res) => {
    const requestData = {
        customerId: req.body.customerId,
        user: req.user
    };

    getCustomerDetails(requestData)
        .then((data) => {
            return res.status(200).send({
                status: data.status,
                message: data.message,
                customer: data.customer,
            });
        })
        .catch((error) => {
            return res.status(400).send({
                status: error.status,
                message: error.message,
            });
        });
});

module.exports = customerRouter;
